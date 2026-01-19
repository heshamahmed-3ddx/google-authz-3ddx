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
                    icon="mdi-shield-edit"
                    size="small"
                    variant="text"
                    color="primary"
                    @click="openEditPermissions(group.groupName)"
                    class="mr-2"
                  >
                    <v-icon>mdi-shield-edit</v-icon>
                    <v-tooltip activator="parent" location="top">Edit Permissions</v-tooltip>
                  </v-btn>
                  <v-btn
                    icon="mdi-delete"
                    size="small"
                    variant="text"
                    color="error"
                    :loading="deletingGroup === group.groupName"
                    @click="confirmDeleteGroup(group.groupName)"
                  >
                    <v-icon>mdi-delete</v-icon>
                    <v-tooltip activator="parent" location="top">Remove Group</v-tooltip>
                  </v-btn>
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
                <div class="text-subtitle-2 mb-2">How it works - Complete Process</div>
                
                <div class="text-body-2 text-medium-emphasis mb-3">
                  <strong>Step 1: User Login</strong>
                  <ul class="ml-4 mt-1">
                    <li>User logs in with their Google Workspace account</li>
                    <li>System fetches their Google groups automatically</li>
                  </ul>
                </div>

                <div class="text-body-2 text-medium-emphasis mb-3">
                  <strong>Step 2: Access Control Check</strong>
                  <ul class="ml-4 mt-1">
                    <li>System checks if user belongs to any "Allowed Groups" configured below</li>
                    <li>If not in any allowed group → Access denied</li>
                    <li>If in an allowed group → Access granted, continue to Step 3</li>
                  </ul>
                </div>

                <div class="text-body-2 text-medium-emphasis mb-3">
                  <strong>Step 3: Permission Check (Per Group)</strong>
                  <ul class="ml-4 mt-1">
                    <li>Each allowed group has specific permissions (resources + actions)</li>
                    <li>Example: "Finance" group can "read" reports, "write" invoices</li>
                    <li>User inherits all permissions from their groups</li>
                  </ul>
                </div>

                <div class="text-body-2 text-medium-emphasis mb-3">
                  <strong>Managing Groups & Permissions:</strong>
                  <ul class="ml-4 mt-1">
                    <li><strong>Add Group:</strong> Enter Google group name above (e.g., "Finance", "Engineering")</li>
                    <li><strong>Edit Permissions:</strong> Click <v-icon size="small" color="primary">mdi-shield-edit</v-icon> next to any group to manage what they can access</li>
                    <li><strong>Remove Group:</strong> Click <v-icon size="small" color="error">mdi-delete</v-icon> to revoke all access for that group</li>
                  </ul>
                </div>

                <div class="text-body-2 text-medium-emphasis">
                  <strong>Important Notes:</strong>
                  <ul class="ml-4 mt-1">
                    <li>Members of <strong>SWD</strong> group are always super admins (full access)</li>
                    <li>Group names must match exactly as they appear in Google Workspace</li>
                    <li>Changes take effect immediately (no restart needed)</li>
                    <li>All policies are stored in the database for dynamic updates</li>
                  </ul>
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Edit Group Permissions Dialog -->
    <v-dialog v-model="editPermissionsDialog" max-width="800" scrollable>
      <v-card>
        <v-card-title class="d-flex align-center bg-primary">
          <v-icon class="mr-2">mdi-shield-edit</v-icon>
          Edit Permissions: {{ selectedGroup }}
        </v-card-title>
        
        <v-divider></v-divider>

        <!-- Add Resource/Action -->
        <v-card-text class="pt-4">
          <v-form @submit.prevent="addPermissionToGroup" ref="addPermissionForm">
            <v-row>
              <v-col cols="12" sm="6">
                <v-combobox
                  v-model="newPermission.resource"
                  label="Resource"
                  hint="Select from existing or type a new resource name"
                  persistent-hint
                  :items="availableResources"
                  :disabled="loadingPermission"
                  variant="outlined"
                  density="comfortable"
                  clearable
                >
                  <template v-slot:prepend-inner>
                    <v-icon>mdi-file-document</v-icon>
                  </template>
                  <template v-slot:no-data>
                    <v-list-item>
                      <v-list-item-title class="text-caption">
                        Type a resource name (e.g., dashboard, reports, users)
                      </v-list-item-title>
                    </v-list-item>
                  </template>
                </v-combobox>
              </v-col>
              <v-col cols="12" sm="4">
                <v-select
                  v-model="newPermission.action"
                  label="Action"
                  :items="['read', 'write', 'delete', 'manage', 'access', 'create', 'update']"
                  :disabled="loadingPermission"
                  variant="outlined"
                  density="comfortable"
                >
                  <template v-slot:prepend-inner>
                    <v-icon>mdi-lightning-bolt</v-icon>
                  </template>
                </v-select>
              </v-col>
              <v-col cols="12" sm="2" class="d-flex align-center">
                <v-btn
                  type="submit"
                  color="primary"
                  size="large"
                  :loading="loadingPermission"
                  :disabled="!newPermission.resource || !newPermission.action || loadingPermission"
                  block
                >
                  <v-icon>mdi-plus</v-icon>
                </v-btn>
              </v-col>
            </v-row>
          </v-form>

          <v-divider class="my-4"></v-divider>

          <!-- Permissions List -->
          <div v-if="loadingGroupPermissions" class="text-center py-8">
            <v-progress-circular indeterminate color="primary"></v-progress-circular>
            <p class="text-body-2 text-medium-emphasis mt-4">Loading permissions...</p>
          </div>

          <div v-else-if="groupPermissions.length === 0" class="text-center py-8">
            <v-icon size="48" color="grey-lighten-1">mdi-shield-alert-outline</v-icon>
            <p class="text-body-1 text-medium-emphasis mt-4">No permissions configured</p>
            <p class="text-body-2 text-medium-emphasis">Add a resource and action above</p>
          </div>

          <v-list v-else lines="one">
            <v-list-item
              v-for="(permission, index) in groupPermissions"
              :key="index"
              :class="{ 'border-b': index < groupPermissions.length - 1 }"
            >
              <template v-slot:prepend>
                <v-avatar :color="getActionColor(permission.action)" size="36" variant="tonal">
                  <v-icon size="20" color="white">{{ getActionIcon(permission.action) }}</v-icon>
                </v-avatar>
              </template>

              <v-list-item-title class="font-weight-medium">
                {{ permission.resource }}
              </v-list-item-title>
              <v-list-item-subtitle>
                <v-chip size="small" :color="getActionColor(permission.action)" variant="tonal" class="mt-1">
                  {{ permission.action }}
                </v-chip>
              </v-list-item-subtitle>

              <template v-slot:append>
                <v-btn
                  icon="mdi-delete"
                  size="small"
                  variant="text"
                  color="error"
                  :loading="deletingPermission === `${permission.resource}-${permission.action}`"
                  @click="removePermissionFromGroup(permission)"
                ></v-btn>
              </template>
            </v-list-item>
          </v-list>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            variant="flat"
            @click="editPermissionsDialog = false"
          >
            Done
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

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

    <!-- Delete Policy Confirmation Dialog -->
    <v-dialog v-model="deletePolicyDialog" max-width="500">
      <v-card>
        <v-card-title class="text-h5">
          <v-icon class="mr-2" color="warning">mdi-alert</v-icon>
          Confirm Policy Removal
        </v-card-title>
        <v-card-text>
          Are you sure you want to remove this policy?
          <br><br>
          <v-chip size="small" color="primary" variant="tonal" class="mr-2">
            {{ policyToDelete?.subject }}
          </v-chip>
          →
          <v-chip size="small" color="secondary" variant="tonal" class="mx-2">
            {{ policyToDelete?.object }}
          </v-chip>
          →
          <v-chip size="small" color="info" variant="tonal" class="ml-2">
            {{ policyToDelete?.action }}
          </v-chip>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            text
            @click="deletePolicyDialog = false"
            :disabled="deletingPolicy"
          >
            Cancel
          </v-btn>
          <v-btn
            color="error"
            variant="flat"
            @click="deletePolicy"
            :loading="deletingPolicy"
          >
            Remove Policy
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
import { ref, onMounted, computed } from 'vue';
import api from '@/services/api';

const allowedGroups = ref([]);
const newGroupName = ref('');
const loading = ref(false);
const loadingGroups = ref(false);
const deletingGroup = ref(null);
const deleteDialog = ref(false);
const groupToDelete = ref('');
const addGroupForm = ref(null);

// Group permissions dialog
const editPermissionsDialog = ref(false);
const selectedGroup = ref('');
const groupPermissions = ref([]);
const newPermission = ref({ resource: '', action: '' });
const loadingPermission = ref(false);
const loadingGroupPermissions = ref(false);
const deletingPermission = ref(null);
const addPermissionForm = ref(null);

// Policies management (keeping for backward compatibility)
const policies = ref([]);
const newPolicy = ref({ subject: '', object: '', action: '' });
const loadingPolicy = ref(false);
const loadingPolicies = ref(false);
const deletingPolicy = ref(null);
const deletePolicyDialog = ref(false);
const policyToDelete = ref(null);
const addPolicyForm = ref(null);

// Snackbar
const snackbar = ref(false);
const snackbarMessage = ref('');
const snackbarColor = ref('success');

// Computed: available groups for policy subject dropdown
const availableGroups = computed(() => {
  return allowedGroups.value.map(g => g.groupName);
});

// Computed: available resources from existing policies
const availableResources = computed(() => {
  if (!policies.value || policies.value.length === 0) return [];
  // Get unique resources from all policies
  const uniqueResources = [...new Set(policies.value.map(p => p.object))];
  return uniqueResources.sort();
});

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

// Group permissions management
async function openEditPermissions(groupName) {
  selectedGroup.value = groupName;
  editPermissionsDialog.value = true;
  // Load both group permissions and all policies to populate autocomplete
  await Promise.all([
    loadGroupPermissions(groupName),
    fetchPolicies()
  ]);
}

async function loadGroupPermissions(groupName) {
  loadingGroupPermissions.value = true;
  try {
    const response = await api.get('/admin/policies');
    const allPolicies = response.data.data?.policies || response.data.policies || [];
    
    // Filter policies for this specific group
    groupPermissions.value = allPolicies
      .filter(p => p.subject === groupName)
      .map(p => ({ resource: p.object, action: p.action }));
  } catch (error) {
    console.error('Error loading group permissions:', error);
    showMessage('Failed to load permissions: ' + (error.response?.data?.message || error.message), 'error');
  } finally {
    loadingGroupPermissions.value = false;
  }
}

async function addPermissionToGroup() {
  if (!newPermission.value.resource || !newPermission.value.action) {
    return;
  }

  loadingPermission.value = true;
  try {
    await api.post('/admin/policies', {
      subject: selectedGroup.value,
      object: newPermission.value.resource.trim(),
      action: newPermission.value.action
    });
    
    showMessage('Permission added successfully', 'success');
    newPermission.value = { resource: '', action: '' };
    addPermissionForm.value?.reset();
    await loadGroupPermissions(selectedGroup.value);
  } catch (error) {
    console.error('Error adding permission:', error);
    const errorMsg = error.response?.data?.message || error.message;
    showMessage('Failed to add permission: ' + errorMsg, 'error');
  } finally {
    loadingPermission.value = false;
  }
}

async function removePermissionFromGroup(permission) {
  const permissionKey = `${permission.resource}-${permission.action}`;
  deletingPermission.value = permissionKey;
  
  try {
    await api.delete('/admin/policies', {
      data: {
        subject: selectedGroup.value,
        object: permission.resource,
        action: permission.action
      }
    });
    
    showMessage('Permission removed successfully', 'success');
    await loadGroupPermissions(selectedGroup.value);
  } catch (error) {
    console.error('Error removing permission:', error);
    const errorMsg = error.response?.data?.message || error.message;
    showMessage('Failed to remove permission: ' + errorMsg, 'error');
  } finally {
    deletingPermission.value = null;
  }
}

// Policies management functions (legacy - keeping for compatibility)
async function fetchPolicies() {
  loadingPolicies.value = true;
  try {
    const response = await api.get('/admin/policies');
    policies.value = response.data.data?.policies || response.data.policies || [];
  } catch (error) {
    console.error('Error fetching policies:', error);
    showMessage('Failed to load policies: ' + (error.response?.data?.message || error.message), 'error');
  } finally {
    loadingPolicies.value = false;
  }
}

async function addPolicy() {
  if (!newPolicy.value.subject || !newPolicy.value.object || !newPolicy.value.action) {
    return;
  }

  loadingPolicy.value = true;
  try {
    await api.post('/admin/policies', {
      subject: newPolicy.value.subject.trim(),
      object: newPolicy.value.object.trim(),
      action: newPolicy.value.action
    });
    
    showMessage('Policy added successfully', 'success');
    newPolicy.value = { subject: '', object: '', action: '' };
    addPolicyForm.value?.reset();
    await fetchPolicies();
  } catch (error) {
    console.error('Error adding policy:', error);
    const errorMsg = error.response?.data?.message || error.message;
    showMessage('Failed to add policy: ' + errorMsg, 'error');
  } finally {
    loadingPolicy.value = false;
  }
}

function confirmDeletePolicy(policy) {
  policyToDelete.value = policy;
  deletePolicyDialog.value = true;
}

async function deletePolicy() {
  if (!policyToDelete.value) return;

  const policyKey = `${policyToDelete.value.subject}-${policyToDelete.value.object}-${policyToDelete.value.action}`;
  deletingPolicy.value = policyKey;
  try {
    await api.delete('/admin/policies', {
      data: {
        subject: policyToDelete.value.subject,
        object: policyToDelete.value.object,
        action: policyToDelete.value.action
      }
    });
    
    showMessage('Policy removed successfully', 'success');
    deletePolicyDialog.value = false;
    policyToDelete.value = null;
    await fetchPolicies();
  } catch (error) {
    console.error('Error deleting policy:', error);
    const errorMsg = error.response?.data?.message || error.message;
    showMessage('Failed to remove policy: ' + errorMsg, 'error');
  } finally {
    deletingPolicy.value = null;
  }
}

function getActionColor(action) {
  const colors = {
    read: 'success',
    write: 'warning',
    delete: 'error',
    manage: 'info',
    access: 'primary'
  };
  return colors[action] || 'grey';
}

function getActionIcon(action) {
  const icons = {
    read: 'mdi-eye',
    write: 'mdi-pencil',
    delete: 'mdi-delete',
    manage: 'mdi-cog',
    access: 'mdi-login'
  };
  return icons[action] || 'mdi-lightning-bolt';
}

onMounted(() => {
  fetchGroups();
  fetchPolicies();
});
</script>

<style scoped>
.border-b {
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}
</style>
