<template>
  <v-container fluid class="pa-6">
    <v-row>
      <v-col cols="12">
        <div class="d-flex align-center mb-6">
          <v-icon size="32" class="mr-3">mdi-shield-account</v-icon>
          <h1 class="text-h4 font-weight-bold">Admin Settings</h1>
        </div>
        
        <!-- Admin Info Alert -->
        <v-alert
          type="info"
          variant="tonal"
          class="mb-6"
          icon="mdi-information"
        >
          <div class="text-subtitle-2 mb-1">Super Admin Access</div>
          <div class="text-body-2">
            You are a member of the <strong>SWD</strong> group. You can manage which Google Workspace groups are allowed to access this application.
          </div>
        </v-alert>

        <!-- Allowed Groups Management -->
        <v-card>
          <v-card-title class="d-flex align-center">
            <v-icon class="mr-2">mdi-account-group</v-icon>
            Allowed Groups
          </v-card-title>
          <v-divider></v-divider>

          <!-- Add New Group Form -->
          <v-card-text>
            <v-form @submit.prevent="addGroup" ref="addGroupForm">
              <v-row>
                <v-col cols="12" md="8">
                  <v-text-field
                    v-model="newGroupName"
                    label="Google Group Name"
                    hint="Enter the exact group name as it appears in Google Workspace (e.g., Finance, Engineering)"
                    persistent-hint
                    :rules="[v => !!v || 'Group name is required']"
                    :disabled="loading"
                    variant="outlined"
                    density="comfortable"
                  >
                    <template v-slot:prepend-inner>
                      <v-icon>mdi-google</v-icon>
                    </template>
                  </v-text-field>
                </v-col>
                <v-col cols="12" md="4" class="d-flex align-center">
                  <v-btn
                    type="submit"
                    color="primary"
                    size="large"
                    :loading="loading"
                    :disabled="!newGroupName || loading"
                    block
                  >
                    <v-icon left class="mr-2">mdi-plus</v-icon>
                    Add Group
                  </v-btn>
                </v-col>
              </v-row>
            </v-form>
          </v-card-text>

          <v-divider></v-divider>

          <!-- Groups List -->
          <v-card-text>
            <div v-if="loadingGroups" class="text-center py-8">
              <v-progress-circular indeterminate color="primary"></v-progress-circular>
              <p class="text-body-2 text-medium-emphasis mt-4">Loading groups...</p>
            </div>

            <div v-else-if="allowedGroups.length === 0" class="text-center py-8">
              <v-icon size="64" color="grey-lighten-1">mdi-account-group-outline</v-icon>
              <p class="text-h6 text-medium-emphasis mt-4">No groups configured</p>
              <p class="text-body-2 text-medium-emphasis">Add your first group above to get started</p>
            </div>

            <v-list v-else lines="two">
              <v-list-item
                v-for="(group, index) in allowedGroups"
                :key="group.groupName"
                :class="{ 'border-b': index < allowedGroups.length - 1 }"
              >
                <template v-slot:prepend>
                  <v-avatar color="primary" size="40">
                    <v-icon>mdi-account-group</v-icon>
                  </v-avatar>
                </template>

                <v-list-item-title class="font-weight-medium">
                  {{ group.groupName }}
                </v-list-item-title>
                <v-list-item-subtitle class="text-caption">
                  Added {{ formatDate(group.createdAt) }}
                </v-list-item-subtitle>

                <template v-slot:append>
                  <v-btn
                    icon="mdi-delete"
                    size="small"
                    variant="text"
                    color="error"
                    :loading="deletingGroup === group.groupName"
                    @click="confirmDeleteGroup(group.groupName)"
                  ></v-btn>
                </template>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>

        <!-- Info Card -->
        <v-card class="mt-6" variant="outlined">
          <v-card-text>
            <div class="d-flex align-start">
              <v-icon class="mr-3 mt-1" color="info">mdi-information-outline</v-icon>
              <div>
                <div class="text-subtitle-2 mb-2">How it works</div>
                <ul class="text-body-2 text-medium-emphasis">
                  <li>Only users who are members of the allowed groups can access this application</li>
                  <li>Members of the <strong>SWD</strong> group always have access and admin rights</li>
                  <li>Group names must match exactly as they appear in Google Workspace</li>
                  <li>Changes take effect immediately on the next user login</li>
                </ul>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="500">
      <v-card>
        <v-card-title class="text-h5">
          <v-icon class="mr-2" color="warning">mdi-alert</v-icon>
          Confirm Removal
        </v-card-title>
        <v-card-text>
          Are you sure you want to remove the <strong>{{ groupToDelete }}</strong> group from the allowed list?
          <br><br>
          Users in this group will no longer be able to access the application (unless they're in another allowed group or the SWD group).
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            text
            @click="deleteDialog = false"
            :disabled="deletingGroup"
          >
            Cancel
          </v-btn>
          <v-btn
            color="error"
            variant="flat"
            @click="deleteGroup"
            :loading="deletingGroup"
          >
            Remove Group
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar for messages -->
    <v-snackbar
      v-model="snackbar"
      :color="snackbarColor"
      :timeout="4000"
      location="top"
    >
      {{ snackbarMessage }}
      <template v-slot:actions>
        <v-btn
          variant="text"
          @click="snackbar = false"
        >
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '@/services/api';

const allowedGroups = ref([]);
const newGroupName = ref('');
const loading = ref(false);
const loadingGroups = ref(false);
const deletingGroup = ref(null);
const deleteDialog = ref(false);
const groupToDelete = ref('');
const addGroupForm = ref(null);

// Snackbar
const snackbar = ref(false);
const snackbarMessage = ref('');
const snackbarColor = ref('success');

async function fetchGroups() {
  loadingGroups.value = true;
  try {
    const response = await api.get('/admin/groups/allowed');
    allowedGroups.value = response.data.groups || [];
  } catch (error) {
    console.error('Error fetching groups:', error);
    showMessage('Failed to load groups: ' + (error.response?.data?.message || error.message), 'error');
  } finally {
    loadingGroups.value = false;
  }
}

async function addGroup() {
  if (!newGroupName.value.trim()) {
    return;
  }

  loading.value = true;
  try {
    await api.post('/admin/groups/allowed', {
      groupName: newGroupName.value.trim()
    });
    
    showMessage(`Group "${newGroupName.value}" added successfully`, 'success');
    newGroupName.value = '';
    addGroupForm.value?.reset();
    await fetchGroups();
  } catch (error) {
    console.error('Error adding group:', error);
    const errorMsg = error.response?.data?.message || error.message;
    showMessage('Failed to add group: ' + errorMsg, 'error');
  } finally {
    loading.value = false;
  }
}

function confirmDeleteGroup(groupName) {
  groupToDelete.value = groupName;
  deleteDialog.value = true;
}

async function deleteGroup() {
  if (!groupToDelete.value) return;

  deletingGroup.value = groupToDelete.value;
  try {
    await api.delete(`/admin/groups/allowed/${encodeURIComponent(groupToDelete.value)}`);
    
    showMessage(`Group "${groupToDelete.value}" removed successfully`, 'success');
    deleteDialog.value = false;
    groupToDelete.value = '';
    await fetchGroups();
  } catch (error) {
    console.error('Error deleting group:', error);
    const errorMsg = error.response?.data?.message || error.message;
    showMessage('Failed to remove group: ' + errorMsg, 'error');
  } finally {
    deletingGroup.value = null;
  }
}

function showMessage(message, color = 'success') {
  snackbarMessage.value = message;
  snackbarColor.value = color;
  snackbar.value = true;
}

function formatDate(dateString) {
  if (!dateString) return 'Unknown';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

onMounted(() => {
  fetchGroups();
});
</script>

<style scoped>
.border-b {
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}
</style>
