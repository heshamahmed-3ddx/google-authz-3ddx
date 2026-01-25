<template>
  <v-badge
    v-if="unreadCount > 0"
    :content="unreadCount"
    :value="unreadCount"
    color="error"
    overlap
  >
    <v-icon>mdi-bell</v-icon>
  </v-badge>
  <v-icon v-else>mdi-bell-outline</v-icon>
</template>

<script>
import announcementService from "@/services/announcementService";

export default {
  name: "AnnouncementBadge",

  props: {
    autoRefresh: {
      type: Boolean,
      default: true,
    },
    refreshInterval: {
      type: Number,
      default: 60000, // 1 minute
    },
  },

  data() {
    return {
      unreadCount: 0,
      refreshTimer: null,
    };
  },

  mounted() {
    this.loadUnreadCount();

    if (this.autoRefresh) {
      this.startAutoRefresh();
    }
  },

  beforeUnmount() {
    this.stopAutoRefresh();
  },

  methods: {
    async loadUnreadCount() {
      try {
        this.unreadCount = await announcementService.getUnreadCount();
        this.$emit("unread-count-updated", this.unreadCount);
      } catch (error) {
        console.error("Failed to load unread count:", error);
      }
    },

    startAutoRefresh() {
      this.refreshTimer = setInterval(() => {
        this.loadUnreadCount();
      }, this.refreshInterval);
    },

    stopAutoRefresh() {
      if (this.refreshTimer) {
        clearInterval(this.refreshTimer);
        this.refreshTimer = null;
      }
    },

    // Public method to manually refresh
    refresh() {
      this.loadUnreadCount();
    },
  },
};
</script>
