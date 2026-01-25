<template>
  <v-container fluid class="announcements-page pa-0">
    <!-- Header -->
    <v-toolbar flat color="transparent" class="px-4 py-2">
      <v-icon large class="mr-3">mdi-bullhorn</v-icon>
      <v-toolbar-title class="text-h5 font-weight-bold">
        Announcements
      </v-toolbar-title>
      <v-spacer />
      <v-btn
        icon
        @click="loadAnnouncements"
        :loading="loading"
        title="Refresh announcements"
      >
        <v-icon>mdi-refresh</v-icon>
      </v-btn>
      <v-chip
        v-if="unreadCount > 0"
        color="primary"
        text-color="white"
        small
        class="ml-2"
      >
        {{ unreadCount }} New
      </v-chip>
    </v-toolbar>

    <v-divider />

    <!-- Filter Tabs -->
    <v-tabs v-model="activeTab" class="px-4" color="primary">
      <v-tab value="all">
        <v-icon small class="mr-2">mdi-bulletin-board</v-icon>
        All
        <v-badge
          v-if="announcements.length > 0"
          :content="announcements.length"
          color="grey"
          inline
          class="ml-2"
        />
      </v-tab>
      <v-tab value="unread">
        <v-icon small class="mr-2">mdi-email</v-icon>
        Unread
        <v-badge
          v-if="unreadCount > 0"
          :content="unreadCount"
          color="primary"
          inline
          class="ml-2"
        />
      </v-tab>
      <v-tab value="important">
        <v-icon small class="mr-2">mdi-alert</v-icon>
        Important
      </v-tab>
    </v-tabs>

    <!-- Content Area -->
    <v-container fluid class="px-4 py-6">
      <!-- Loading State -->
      <div v-if="loading" class="text-center py-8">
        <v-progress-circular indeterminate color="primary" size="64" />
        <p class="text-h6 mt-4 text--secondary">Loading announcements...</p>
      </div>

      <!-- Empty State -->
      <v-card
        v-else-if="filteredAnnouncements.length === 0"
        flat
        class="text-center py-12"
        color="grey lighten-5"
      >
        <v-icon size="80" color="grey lighten-1">mdi-information-outline</v-icon>
        <p class="text-h6 mt-4 mb-2">No announcements to display</p>
        <p class="text-body-2 text--secondary">
          {{ activeTab === 'unread' ? 'All caught up! No unread announcements.' : 'Check back later for updates.' }}
        </p>
      </v-card>

      <!-- Announcements List -->
      <v-row v-else dense>
        <v-col
          v-for="announcement in filteredAnnouncements"
          :key="announcement.id"
          cols="12"
        >
          <v-card
            :class="[
              'announcement-card',
              { 'unread-card': !announcement.is_read },
              `severity-${announcement.severity}`
            ]"
            elevation="1"
            hover
          >
            <!-- Severity Indicator -->
            <div :class="`severity-bar severity-bar-${announcement.severity}`" />
            
            <v-card-text class="pa-4">
              <div class="d-flex align-start">
                <!-- Icon -->
                <v-avatar
                  :color="getSeverityColor(announcement.severity)"
                  size="40"
                  class="mr-4 flex-shrink-0"
                >
                  <v-icon dark>{{ getIcon(announcement.severity) }}</v-icon>
                </v-avatar>

                <!-- Content -->
                <div class="flex-grow-1 announcement-content-wrapper">
                  <!-- Header -->
                  <div class="d-flex align-center mb-2">
                    <h3 class="announcement-title mb-0">{{ announcement.title }}</h3>
                    <v-chip
                      v-if="!announcement.is_read"
                      x-small
                      color="primary"
                      class="ml-2 unread-badge"
                    >
                      NEW
                    </v-chip>
                    <v-chip
                      x-small
                      :color="getSeverityColor(announcement.severity)"
                      text-color="white"
                      class="ml-2"
                    >
                      {{ announcement.severity.toUpperCase() }}
                    </v-chip>
                  </div>

                  <!-- Content -->
                  <div 
                    class="announcement-content text-body-2 mb-3"
                    v-html="formatContent(announcement.content)"
                  />

                  <!-- Meta Information -->
                  <div class="d-flex align-center announcement-meta">
                    <v-icon x-small class="mr-1">mdi-clock-outline</v-icon>
                    <span class="text-caption">{{ formatDate(announcement.start_date) }}</span>
                    <span v-if="announcement.end_date" class="mx-2">•</span>
                    <span v-if="announcement.end_date" class="text-caption">
                      <v-icon x-small class="mr-1">mdi-calendar-end</v-icon>
                      Expires {{ formatDate(announcement.end_date) }}
                    </span>
                  </div>
                </div>

                <!-- Action Button -->
                <v-btn
                  v-if="!announcement.is_read"
                  icon
                  small
                  color="primary"
                  @click.stop="markAsRead(announcement.id)"
                  title="Mark as read"
                  class="ml-2 flex-shrink-0"
                >
                  <v-icon small>mdi-check-circle</v-icon>
                </v-btn>
                <v-icon v-else small color="success" class="ml-2 flex-shrink-0">
                  mdi-check-circle
                </v-icon>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-container>
</template>

<script>
import announcementService from '@/services/announcementService';

export default {
  name: 'AnnouncementDisplay',

  props: {
    autoRefresh: {
      type: Boolean,
      default: false
    },
    refreshInterval: {
      type: Number,
      default: 60000 // 1 minute
    }
  },

  data() {
    return {
      announcements: [],
      loading: false,
      refreshTimer: null,
      activeTab: 'all'
    };
  },

  computed: {
    filteredAnnouncements() {
      if (this.activeTab === 'unread') {
        return this.announcements.filter(a => !a.is_read);
      } else if (this.activeTab === 'important') {
        return this.announcements.filter(a => 
          a.severity === 'error' || a.severity === 'warning'
        );
      }
      return this.announcements;
    },
    
    unreadCount() {
      return this.announcements.filter(a => !a.is_read).length;
    }
  },

  mounted() {
    this.loadAnnouncements();
    
    if (this.autoRefresh) {
      this.startAutoRefresh();
    }
  },

  beforeUnmount() {
    this.stopAutoRefresh();
  },

  methods: {
    async loadAnnouncements() {
      this.loading = true;
      try {
        this.announcements = await announcementService.getActive();
        this.$emit('announcements-loaded', this.announcements);
      } catch (error) {
        console.error('Failed to load announcements:', error);
      } finally {
        this.loading = false;
      }
    },

    async markAsRead(announcementId) {
      try {
        await announcementService.markAsRead(announcementId);
        // Update local state
        const announcement = this.announcements.find(a => a.id === announcementId);
        if (announcement) {
          announcement.is_read = 1;
        }
        this.$emit('announcement-read', announcementId);
        
        // Dispatch custom event for global listeners (e.g., app bar badge)
        window.dispatchEvent(new CustomEvent('announcement-marked-read', { 
          detail: { announcementId } 
        }));
      } catch (error) {
        console.error('Failed to mark announcement as read:', error);
      }
    },

    getAnnouncementColor(severity) {
      const colors = {
        info: 'blue lighten-5',
        warning: 'orange lighten-5',
        success: 'green lighten-5',
        error: 'red lighten-5'
      };
      return colors[severity] || 'grey lighten-5';
    },

    getSeverityColor(severity) {
      const colors = {
        info: '#2196F3',
        warning: '#FF9800',
        success: '#4CAF50',
        error: '#F44336'
      };
      return colors[severity] || '#9E9E9E';
    },

    getIcon(severity) {
      const icons = {
        info: 'mdi-information',
        warning: 'mdi-alert',
        success: 'mdi-check-circle',
        error: 'mdi-alert-circle'
      };
      return icons[severity] || 'mdi-bell';
    },

    formatContent(content) {
      if (!content) return '';
      // Basic HTML sanitization and formatting
      return content
        .replace(/\n/g, '<br>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>');
    },

    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      const now = new Date();
      const diff = now - date;
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const days = Math.floor(hours / 24);

      if (days > 7) {
        return date.toLocaleDateString();
      } else if (days > 0) {
        return `${days} day${days > 1 ? 's' : ''} ago`;
      } else if (hours > 0) {
        return `${hours} hour${hours > 1 ? 's' : ''} ago`;
      } else {
        return 'Just now';
      }
    },

    startAutoRefresh() {
      this.refreshTimer = setInterval(() => {
        this.loadAnnouncements();
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
      this.loadAnnouncements();
    }
  }
};
</script>

<style scoped>
.announcements-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.announcement-card {
  position: relative;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  border-radius: 8px !important;
  overflow: hidden;
  background: white;
  margin-bottom: 16px;
}

.announcement-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12) !important;
}

.unread-card {
  background: #ffffff;
  border-left: 4px solid #2196F3;
  box-shadow: 0 0 0 1px rgba(33, 150, 243, 0.1);
}

.severity-bar {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
}

.severity-bar-info {
  background: linear-gradient(90deg, #2196F3, #64B5F6);
}

.severity-bar-warning {
  background: linear-gradient(90deg, #FF9800, #FFB74D);
}

.severity-bar-success {
  background: linear-gradient(90deg, #4CAF50, #81C784);
}

.severity-bar-error {
  background: linear-gradient(90deg, #F44336, #E57373);
}

.announcement-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1a1a1a;
  line-height: 1.4;
}

.announcement-content-wrapper {
  max-width: calc(100% - 60px);
}

.announcement-content {
  color: #424242;
  line-height: 1.7;
  margin-top: 8px;
  word-wrap: break-word;
}

.announcement-content >>> strong {
  font-weight: 600;
  color: #1a1a1a;
}

.announcement-content >>> em {
  font-style: italic;
  color: #616161;
}

.announcement-meta {
  color: #757575;
  font-size: 0.8125rem;
  margin-top: 12px;
}

.unread-badge {
  font-weight: 700;
  letter-spacing: 0.5px;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .announcement-title {
    font-size: 1rem;
  }
  
  .announcement-card {
    margin-bottom: 12px;
  }
  
  .announcement-content-wrapper {
    max-width: calc(100% - 40px);
  }
}

/* Tab customization */
.v-tabs >>> .v-tab {
  text-transform: none;
  font-weight: 500;
  letter-spacing: 0.25px;
}

.v-tabs >>> .v-tab--active {
  color: #2196F3 !important;
}

/* Toolbar styling */
.v-toolbar {
  background: rgba(255, 255, 255, 0.95) !important;
  backdrop-filter: blur(10px);
}
</style>
