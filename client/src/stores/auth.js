import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { apiService } from "@/services/api";

export const useAuthStore = defineStore("auth", () => {
  const user = ref(null);
  const tokens = ref(null);
  const loading = ref(false);
  const lastAuthCheck = ref(0);
  const authCheckPromise = ref(null);

  // Cache for dashboard data to avoid refetch
  const cachedUserDetails = ref(null);
  const cachedUserRights = ref(null);

  const isAuthenticated = computed(() => !!user.value);

  // Computed: is user in SWD group?
  const isSWD = computed(() => {
    if (!user.value || !user.value.groups) return false;
    return user.value.groups.includes("SWD");
  });

  // Computed: is user in Client Confirmation group?
  const isClientConfirmation = computed(() => {
    if (!user.value || !user.value.groups) return false;
    return user.value.groups.includes("Client Confirmation");
  });

  /**
   * Initiate Google OAuth login by requesting an auth URL from the backend
   * and redirecting the browser to it.
   *
   * @returns {Promise<void>} Resolves when the redirect is triggered.
   * @throws {Error} When the backend does not return a valid auth URL or the request fails.
   */
  const login = async () => {
    try {
      loading.value = true;

      // Get Google OAuth URL from backend
      const { data } = await apiService.get("/auth/google");

      // Redirect to Google OAuth using the URL from backend
      if (data && data.authUrl) {
        window.location.href = data.authUrl;
      } else {
        throw new Error("No auth URL received from backend");
      }
    } catch (error) {
      // Error logging disabled - just re-throw
      loading.value = false;
      throw error;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Handle the OAuth callback flow on the client by sending the authorization
   * code (and optional state) to the backend which exchanges it for tokens.
   * The backend is expected to return a user object on success.
   *
   * @param {string} code - Authorization code returned from Google.
   * @param {string} [state] - Optional state value returned by the OAuth flow.
   * @returns {Promise<Object>} Result object with the user when available.
   * @throws {Error} When the callback exchange fails or an invalid code is provided.
   */
  const handleCallback = async (code, state) => {
    try {
      loading.value = true;

      if (!code) {
        throw new Error("No authorization code provided");
      }

      // Send the authorization code to the backend for processing
      const { data } = await apiService.post("/auth/google/callback", {
        code: code,
        state: state,
      });

      if (data && data.user) {
        user.value = data.user;
        // Fetch local user details (groups/roles) to merge into user
        try {
          await fetchUserDetails();
        } catch (err) {
          // ignore
        }
        // Prefetch dashboard data - will be awaited in CallbackView if needed
        // Don't await here to avoid blocking, but allow caller to await if needed
        prefetchDashboardData().catch(() => {});
        return { success: true, user: data.user };
      } else {
        // Fallback: check auth status
        await checkAuth();
        // Prefetch dashboard data - will be awaited in CallbackView if needed
        prefetchDashboardData().catch(() => {});
        return { success: true };
      }
    } catch (error) {
      // Error logging disabled
      user.value = null;
      tokens.value = null;
      throw error;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Log the user out.
   * Clears client-side auth state immediately and attempts a server-side
   * logout request. Server failures are logged but do not block the UX.
   *
   * @returns {Promise<void>} Resolves when local state is cleared and the
   * server logout attempt has completed (or failed).
   */
  const logout = async () => {
    try {
      // Clear local state immediately so UI can react and redirect
      user.value = null;
      tokens.value = null;
      loading.value = true;

      // Attempt server-side logout; failures are non-blocking for UI
      try {
        await apiService.post("/auth/logout");
      } catch (err) {
        // Error logging disabled (non-blocking)
      }
    } catch (error) {
      // Error logging disabled
      // Ensure local state cleared
      user.value = null;
      tokens.value = null;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Check authentication status against the backend (/auth/me) and populate
   * `user` and `tokens` if authenticated. This function debounces multiple
   * concurrent checks and rate-limits calls to avoid spamming the backend.
   *
   * @returns {Promise<boolean>} True when authenticated, false otherwise.
   */
  const checkAuth = async () => {
    // Prevent multiple concurrent auth checks
    if (authCheckPromise.value) {
      return await authCheckPromise.value;
    }

    // Rate limit auth checks - only allow one every 2 seconds
    const now = Date.now();
    if (now - lastAuthCheck.value < 2000) {
      return isAuthenticated.value;
    }

    authCheckPromise.value = (async () => {
      try {
        loading.value = true;
        lastAuthCheck.value = now;

        const { data } = await apiService.get("/auth/me");

        if (data && data.authenticated && data.user) {
          user.value = data.user;
          // Merge additional local user details (groups/roles)
          try {
            await fetchUserDetails();
          } catch (err) {
            // ignore
          }
          return true;
        } else {
          user.value = null;
          tokens.value = null;
          return false;
        }
      } catch (error) {
        // Silently handle auth check failures - this is expected for non-authenticated users
        user.value = null;
        tokens.value = null;
        return false;
      } finally {
        loading.value = false;
        authCheckPromise.value = null;
      }
    })();

    return await authCheckPromise.value;
  };

  /**
   * Refresh profile information. Prefer the local `/api/user/details` which
   * includes groups/roles/org data; fall back to Google `/api/profile` if
   * necessary. Merges returned fields into the current `user` object.
   *
   * @returns {Promise<Object>} The profile data returned by the server.
   * @throws {Error} If both endpoints fail.
   */
  const refreshProfile = async () => {
    // Prefer local system details which include groups/roles
    try {
      const { data } = await apiService.get("/api/user/details");
      if (data?.data) {
        // merge returned user details into the auth user object
        user.value = { ...user.value, ...data.data };
      }
      return data;
    } catch (err) {
      // Fallback to Google profile endpoint
      const { data } = await apiService.get("/api/profile");
      if (data.profile) {
        user.value = { ...user.value, ...data.profile };
      }
      return data;
    }
  };

  // Fetch user details from local API (includes groups/roles/org info)
  /**
   * Fetch user details from the local API (/api/user/details) which contains
   * authorization metadata such as groups and roles. Merges returned details
   * into `user` when successful.
   *
   * @returns {Promise<Object|null>} The user details object or null on failure.
   */
  const fetchUserDetails = async () => {
    try {
      const { data } = await apiService.get("/api/user/details");
      if (data?.data) {
        user.value = { ...user.value, ...data.data };
        cachedUserDetails.value = data.data; // Cache for dashboard
        return data.data;
      }
      return null;
    } catch (error) {
      // Error logging disabled (non-blocking)
      return null;
    }
  };

  /**
   * Prefetch dashboard data (user details + rights) in parallel
   * to speed up initial dashboard load. This is non-blocking.
   */
  const prefetchDashboardData = async () => {
    try {
      const [detailsRes, rightsRes] = await Promise.all([
        apiService.get("/api/user/details"),
        apiService.get("/api/user/rights"),
      ]);

      if (detailsRes.data?.data) {
        cachedUserDetails.value = detailsRes.data.data;
      }
      if (rightsRes.data?.data) {
        cachedUserRights.value = rightsRes.data.data;
      }
    } catch (error) {
      // Silently fail - dashboard will fetch on mount if needed
    }
  };

  return {
    user,
    tokens,
    loading,
    isAuthenticated,
    isSWD,
    isClientConfirmation,
    login,
    handleCallback,
    logout,
    checkAuth,
    refreshProfile,
    cachedUserDetails,
    cachedUserRights,
    prefetchDashboardData,
  };
});
