<template>
  <v-container fluid>
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center">
        <span>Announcements Management</span>
        <v-btn color="primary" @click="openCreateDialog">
          <v-icon left>mdi-plus</v-icon>
          New Announcement
        </v-btn>
      </v-card-title>

      <v-card-text>
        <!-- Filter Options -->
        <v-row class="mb-4">
          <v-col cols="12" md="4">
            <v-checkbox
              v-model="activeOnly"
              label="Show Active Only"
              @change="loadAnnouncements"
            />
          </v-col>
        </v-row>

        <!-- Announcements Table -->
        <v-data-table
          :headers="headers"
          :items="announcements"
          :loading="loading"
          item-key="id"
          class="elevation-1"
        >
          <template v-slot:item.severity="{ item }">
            <v-chip :color="getSeverityColor(item.severity)" small>
              {{ item.severity }}
            </v-chip>
          </template>

          <template v-slot:item.is_active="{ item }">
            <v-chip :color="item.is_active ? 'success' : 'grey'" small>
              {{ item.is_active ? 'Active' : 'Inactive' }}
            </v-chip>
          </template>

          <template v-slot:item.start_date="{ item }">
            {{ formatDate(item.start_date) }}
          </template>

          <template v-slot:item.end_date="{ item }">
            {{ item.end_date ? formatDate(item.end_date) : 'No End Date' }}
          </template>

          <template v-slot:item.actions="{ item }">
            <v-btn icon small @click="openEditDialog(item)" class="mr-2">
              <v-icon small>mdi-pencil</v-icon>
            </v-btn>
            <v-btn icon small color="error" @click="confirmDelete(item)">
              <v-icon small>mdi-delete</v-icon>
            </v-btn>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <!-- Create/Edit Dialog -->
    <v-dialog v-model="dialog" max-width="800px" persistent>
      <v-card>
        <v-card-title>
          {{ editMode ? 'Edit Announcement' : 'Create Announcement' }}
        </v-card-title>

        <v-card-text>
          <v-form ref="form" v-model="valid">
            <v-text-field
              v-model="formData.title"
              label="Title"
              :rules="[v => !!v || 'Title is required']"
              required
            />

            <v-textarea
              v-model="formData.content"
              label="Content"
              :rules="[v => !!v || 'Content is required']"
              rows="4"
              required
            />

            <v-select
              v-model="formData.severity"
              :items="severityOptions"
              label="Severity"
              required
            />

            <v-checkbox
              v-model="formData.is_active"
              label="Active"
            />

            <v-text-field
              v-model="formData.start_date"
              label="Start Date"
              type="datetime-local"
              :rules="[v => !!v || 'Start date is required']"
              required
            />

            <v-text-field
              v-model="formData.end_date"
              label="End Date (Optional)"
              type="datetime-local"
              clearable
            />
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn text @click="closeDialog">Cancel</v-btn>
          <v-btn color="primary" @click="saveAnnouncement" :disabled="!valid">
            {{ editMode ? 'Update' : 'Create' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="400px">
      <v-card>
        <v-card-title>Confirm Delete</v-card-title>
        <v-card-text>
          Are you sure you want to delete this announcement?
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="deleteDialog = false">Cancel</v-btn>
          <v-btn color="error" @click="deleteAnnouncement">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar for notifications -->
    <v-snackbar v-model="snackbar" :color="snackbarColor" :timeout="3000">
      {{ snackbarMessage }}
    </v-snackbar>
  </v-container>
</template>

<script>
import announcementService from '@/services/announcementService';

export default {
  name: 'AnnouncementManagement',

  data() {
    return {
      announcements: [],
      loading: false,
      activeOnly: false,
      dialog: false,
      deleteDialog: false,
      editMode: false,
      valid: false,
      formData: {
        title: '',
        content: '',
        severity: 'info',
        is_active: true,
        start_date: '',
        end_date: null
      },
      selectedItem: null,
      headers: [
        { text: 'ID', value: 'id', width: '80px' },
        { text: 'Title', value: 'title' },
        { text: 'Severity', value: 'severity', width: '120px' },
        { text: 'Status', value: 'is_active', width: '120px' },
        { text: 'Start Date', value: 'start_date', width: '180px' },
        { text: 'End Date', value: 'end_date', width: '180px' },
        { text: 'Actions', value: 'actions', sortable: false, width: '120px' }
      ],
      severityOptions: ['info', 'warning', 'success', 'error'],
      snackbar: false,
      snackbarMessage: '',
      snackbarColor: 'success'
    };
  },

  mounted() {
    this.loadAnnouncements();
  },

  methods: {
    async loadAnnouncements() {
      this.loading = true;
      try {
        this.announcements = await announcementService.getAllForAdmin({
          activeOnly: this.activeOnly
        });
      } catch (error) {
        this.showSnackbar('Failed to load announcements', 'error');
      } finally {
        this.loading = false;
      }
    },

    openCreateDialog() {
      this.editMode = false;
      this.resetForm();
      this.dialog = true;
    },

    openEditDialog(item) {
      this.editMode = true;
      this.selectedItem = item;
      this.formData = {
        title: item.title,
        content: item.content,
        severity: item.severity,
        is_active: item.is_active === 1,
        start_date: this.formatDateTimeForInput(item.start_date),
        end_date: item.end_date ? this.formatDateTimeForInput(item.end_date) : null
      };
      this.dialog = true;
    },

    closeDialog() {
      this.dialog = false;
      this.resetForm();
    },

    resetForm() {
      this.formData = {
        title: '',
        content: '',
        severity: 'info',
        is_active: true,
        start_date: '',
        end_date: null
      };
      this.selectedItem = null;
      if (this.$refs.form) {
        this.$refs.form.resetValidation();
      }
    },

    async saveAnnouncement() {
      if (!this.$refs.form.validate()) return;

      try {
        const data = {
          ...this.formData,
          start_date: this.formatDateTimeForDb(this.formData.start_date),
          end_date: this.formData.end_date ? this.formatDateTimeForDb(this.formData.end_date) : null
        };

        if (this.editMode) {
          await announcementService.update(this.selectedItem.id, data);
          this.showSnackbar('Announcement updated successfully', 'success');
        } else {
          await announcementService.create(data);
          this.showSnackbar('Announcement created successfully', 'success');
        }

        this.closeDialog();
        this.loadAnnouncements();
      } catch (error) {
        this.showSnackbar('Failed to save announcement', 'error');
      }
    },

    confirmDelete(item) {
      this.selectedItem = item;
      this.deleteDialog = true;
    },

    async deleteAnnouncement() {
      try {
        await announcementService.delete(this.selectedItem.id);
        this.showSnackbar('Announcement deleted successfully', 'success');
        this.deleteDialog = false;
        this.selectedItem = null;
        this.loadAnnouncements();
      } catch (error) {
        this.showSnackbar('Failed to delete announcement', 'error');
      }
    },

    getSeverityColor(severity) {
      const colors = {
        info: 'blue',
        warning: 'orange',
        success: 'green',
        error: 'red'
      };
      return colors[severity] || 'grey';
    },

    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    },

    formatDateTimeForInput(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      const offset = date.getTimezoneOffset();
      const localDate = new Date(date.getTime() - offset * 60 * 1000);
      return localDate.toISOString().slice(0, 16);
    },

    formatDateTimeForDb(dateString) {
      if (!dateString) return null;
      const date = new Date(dateString);
      return date.toISOString().slice(0, 19).replace('T', ' ');
    },

    showSnackbar(message, color = 'success') {
      this.snackbarMessage = message;
      this.snackbarColor = color;
      this.snackbar = true;
    }
  }
};
</script>

<style scoped>
/* Add any custom styles here */
</style>
