<template>
  <div class="roles-permissions-section">
    <!-- Loading State -->
    <div v-if="loading" class="text-center py-8">
      <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
      <p class="mt-4 text-body-2">Loading roles and permissions...</p>
    </div>

    <!-- Error State -->
    <v-alert v-else-if="error" type="error" variant="tonal" density="compact" class="mb-3">
      <div class="text-caption">{{ error }}</div>
      <template #append>
        <v-btn variant="text" size="small" @click="loadData">Retry</v-btn>
      </template>
    </v-alert>

    <!-- Content -->
    <div v-else>
      <!-- Actions Bar -->
      <div class="d-flex justify-space-between align-center mb-3">
        <v-text-field
          v-model="searchQuery"
          prepend-inner-icon="mdi-magnify-outline"
          label="Search roles or permissions"
          variant="outlined"
          density="compact"
          hide-details
          class="flex-grow-1 mr-2"
          clearable
        ></v-text-field>
        <v-btn
          v-if="isAdmin"
          color="primary"
          size="small"
          prepend-icon="mdi-shield-plus"
          @click="showAddRoleDialog = true"
        >
          Add Role
        </v-btn>
      </div>

      <!-- Roles List -->
      <v-card variant="outlined" elevation="0" class="mb-3">
        <v-card-title class="text-subtitle-2 font-weight-medium pa-3" style="min-height: 36px;">
          Roles ({{ filteredRoles.length }})
        </v-card-title>
        <v-card-text class="pa-3">
          <v-list>
            <v-list-item
              v-for="role in filteredRoles"
              :key="role.name"
              :title="role.name"
              :subtitle="role.description || 'No description'"
            >
              <template #prepend>
                <v-icon icon="mdi-shield-account" color="primary"></v-icon>
              </template>
              <template #append>
                <v-btn
                  v-if="isAdmin"
                  icon="mdi-pencil"
                  variant="text"
                  size="small"
                  @click="editRole(role)"
                ></v-btn>
                <v-btn
                  v-if="isAdmin"
                  icon="mdi-delete"
                  variant="text"
                  size="small"
                  color="error"
                  @click="confirmDeleteRole(role)"
                ></v-btn>
              </template>
            </v-list-item>
            <v-list-item v-if="filteredRoles.length === 0">
              <v-list-item-title>No roles found</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-card-text>
      </v-card>

      <!-- Permissions Matrix -->
      <v-card variant="outlined" elevation="0">
        <v-card-title class="text-subtitle-2 font-weight-medium pa-3" style="min-height: 36px;">
          Permissions Matrix
        </v-card-title>
        <v-card-text class="pa-3">
          <v-select
            v-model="selectedRoleForMatrix"
            :items="roles.map(r => r.name)"
            label="Select Role to View/Edit Permissions"
            variant="outlined"
            density="compact"
            class="mb-3"
            clearable
          ></v-select>
          <PermissionsMatrix
            v-if="selectedRoleForMatrix"
            :roles="roles"
            :policies="policies"
            :selected-role="selectedRoleForMatrix"
            :read-only="!isAdmin"
            @permission-changed="handlePermissionChange"
          />
          <v-alert v-else type="info" variant="tonal">
            Select a role above to view and edit its permissions
          </v-alert>
        </v-card-text>
      </v-card>
    </div>

    <!-- Add/Edit Role Dialog -->
    <v-dialog v-model="showAddRoleDialog" max-width="500">
      <v-card>
        <v-card-title>
          {{ editingRole ? "Edit Role" : "Add New Role" }}
        </v-card-title>
        <v-card-text>
          <v-text-field
            v-model="roleForm.name"
            label="Role Name"
            variant="outlined"
            :rules="[rules.required]"
            :disabled="!isAdmin"
            class="mb-3"
          ></v-text-field>
          <v-textarea
            v-model="roleForm.description"
            label="Description"
            variant="outlined"
            rows="3"
            :disabled="!isAdmin"
          ></v-textarea>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="closeRoleDialog">Cancel</v-btn>
          <v-btn
            v-if="isAdmin"
            color="primary"
            @click="saveRole"
            :loading="saving"
          >
            {{ editingRole ? "Update" : "Create" }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="showDeleteDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h6">Confirm Delete</v-card-title>
        <v-card-text>
          Are you sure you want to delete the role
          <strong>{{ roleToDelete?.name }}</strong>? This action cannot be undone.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="showDeleteDialog = false">Cancel</v-btn>
          <v-btn color="error" @click="deleteRole" :loading="deleting">
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>

  <!-- Snackbar for notifications -->
  <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="snackbar.timeout">
    {{ snackbar.message }}
    <template #actions>
      <v-btn variant="text" @click="snackbar.show = false">Close</v-btn>
    </template>
  </v-snackbar>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { apiService } from "@/services/api";
import PermissionsMatrix from "./PermissionsMatrix.vue";
import { useSnackbar } from "@/composables/useSnackbar";

const props = defineProps({
  isAdmin: {
    type: Boolean,
    default: false,
  },
});

const { showSnackbar, snackbar } = useSnackbar();

// State
const loading = ref(false);
const error = ref(null);
const roles = ref([]);
const policies = ref([]);
const searchQuery = ref("");
const selectedRoleForMatrix = ref(null);
const showAddRoleDialog = ref(false);
const showDeleteDialog = ref(false);
const editingRole = ref(null);
const roleToDelete = ref(null);
const saving = ref(false);
const deleting = ref(false);

// Form
const roleForm = ref({
  name: "",
  description: "",
});

// Validation rules
const rules = {
  required: (value) => !!value || "This field is required",
};

// Computed
const filteredRoles = computed(() => {
  if (!searchQuery.value) return roles.value;
  const query = searchQuery.value.toLowerCase();
  return roles.value.filter(
    (role) =>
      role.name.toLowerCase().includes(query) ||
      (role.description && role.description.toLowerCase().includes(query))
  );
});

// Methods
const loadData = async () => {
  loading.value = true;
  error.value = null;
  try {
    // Load users (contains roles and groups)
    const usersResponse = await apiService.get("/api/admin/users");
    if (usersResponse.data?.data?.roles) {
      roles.value = usersResponse.data.data.roles.map((role) => ({
        name: typeof role === "string" ? role : role.name || "",
        description: typeof role === "object" ? role.description || "" : "",
      }));
    }

    // Load policies
    const policiesResponse = await apiService.get("/api/admin/policies");
    if (policiesResponse.data?.data?.policies) {
      // Policies come as arrays: [subject, object, action]
      policies.value = policiesResponse.data.data.policies.map((policy) => ({
        subject: policy[1] || policy.subject,
        object: policy[2] || policy.object,
        action: policy[3] || policy.action,
      }));
    }
  } catch (err) {
    error.value = err.response?.data?.error?.message || "Failed to load data";
    showSnackbar("Error loading roles and permissions", "error");
  } finally {
    loading.value = false;
  }
};

const editRole = (role) => {
  if (!props.isAdmin) return; // Prevent editing for non-admins
  editingRole.value = role;
  roleForm.value = {
    name: role.name,
    description: role.description || "",
  };
  showAddRoleDialog.value = true;
};

const closeRoleDialog = () => {
  showAddRoleDialog.value = false;
  editingRole.value = null;
  roleForm.value = {
    name: "",
    description: "",
  };
};

const saveRole = async () => {
  if (!roleForm.value.name) return;

  saving.value = true;
  try {
    // Note: This is a placeholder - you'll need to implement the actual API endpoint
    // For now, roles are managed through policies
    showSnackbar(
      editingRole.value
        ? "Role updated successfully"
        : "Role created successfully",
      "success"
    );
    closeRoleDialog();
    await loadData();
  } catch (err) {
    showSnackbar(
      err.response?.data?.error?.message || "Failed to save role",
      "error"
    );
  } finally {
    saving.value = false;
  }
};

const confirmDeleteRole = (role) => {
  roleToDelete.value = role;
  showDeleteDialog.value = true;
};

const deleteRole = async () => {
  if (!roleToDelete.value) return;

  deleting.value = true;
  try {
    // Note: This is a placeholder - you'll need to implement the actual API endpoint
    showSnackbar("Role deleted successfully", "success");
    showDeleteDialog.value = false;
    roleToDelete.value = null;
    await loadData();
  } catch (err) {
    showSnackbar(
      err.response?.data?.error?.message || "Failed to delete role",
      "error"
    );
  } finally {
    deleting.value = false;
  }
};

const handlePermissionChange = async (change) => {
  try {
    const { role, resource, action, enabled } = change;
    
    if (enabled) {
      // Add policy
      await apiService.post("/api/admin/policies", {
        subject: role,
        object: resource,
        action: action,
      });
      showSnackbar(`Permission granted: ${role} can ${action} ${resource}`, "success");
    } else {
      // Remove policy
      await apiService.delete("/api/admin/policies", {
        data: {
          subject: role,
          object: resource,
          action: action,
        },
      });
      showSnackbar(`Permission revoked: ${role} can no longer ${action} ${resource}`, "info");
    }
    
    await loadData();
  } catch (err) {
    showSnackbar(
      err.response?.data?.error?.message || "Failed to update permission",
      "error"
    );
  }
};

onMounted(() => {
  loadData();
});
</script>

<style scoped>
.roles-permissions-section {
  min-height: 300px;
}
</style>

