<template>
  <v-card class="mb-6" elevation="3">
    <v-card-title>
      <v-icon class="mr-2" color="error">mdi-shield-crown</v-icon>
      {{ $t("admin.title") || "Admin Panel - User & Policy Management" }}
    </v-card-title>

    <v-card-text>
      <!-- Admin Tabs -->
      <v-tabs v-model="activeTab" color="primary" align-tabs="center">
        <v-tab value="users">
          <v-icon class="mr-2">mdi-account-group</v-icon>
          {{ $t("admin.users") || "Users" }}
        </v-tab>
        <v-tab value="policies">
          <v-icon class="mr-2">mdi-shield-check</v-icon>
          {{ $t("admin.policies") || "Policies" }}
        </v-tab>
        <v-tab value="groups">
          <v-icon class="mr-2">mdi-account-multiple</v-icon>
          {{ $t("admin.groups") || "Groups" }}
        </v-tab>
      </v-tabs>

      <v-window v-model="activeTab" class="mt-4">
        <!-- Users Tab -->
        <v-window-item value="users">
          <div class="d-flex justify-space-between align-center mb-4">
            <h3>{{ $t("admin.userManagement") || "User Management" }}</h3>
            <v-btn
              :loading="loading.refresh"
              variant="outlined"
              prepend-icon="mdi-refresh"
              @click="refreshData"
            >
              {{ $t("admin.refresh") || "Refresh" }}
            </v-btn>
          </div>

          <!-- Users Table -->
          <v-data-table
            :headers="userHeaders"
            :items="users"
            :loading="loading.users"
            class="elevation-1"
            item-key="email"
          >
            <template #[`item.groups`]="{ item }">
              <v-chip-group>
                <v-chip
                  v-for="group in item.groups"
                  :key="group"
                  size="small"
                  color="primary"
                >
                  {{ group }}
                </v-chip>
              </v-chip-group>
            </template>

            <template #[`item.roles`]="{ item }">
              <v-chip-group>
                <v-chip
                  v-for="role in item.roles"
                  :key="role"
                  size="small"
                  color="secondary"
                >
                  {{ role }}
                </v-chip>
              </v-chip-group>
            </template>

            <template #[`item.actions`]="{ item }">
              <v-btn
                size="small"
                variant="text"
                icon="mdi-pencil"
                :title="$t('admin.editUser') || 'Edit User'"
                @click="editUser(item)"
              />
            </template>
          </v-data-table>
        </v-window-item>

        <!-- Policies Tab -->
        <v-window-item value="policies">
          <div class="d-flex justify-space-between align-center mb-4">
            <h3>{{ $t("admin.policyManagement") || "Policy Management" }}</h3>
            <v-btn
              color="primary"
              prepend-icon="mdi-plus"
              @click="showAddPolicy = true"
            >
              {{ $t("admin.addPolicy") || "Add Policy" }}
            </v-btn>
          </div>

          <!-- Policies Table -->
          <v-data-table
            :headers="policyHeaders"
            :items="policies"
            :loading="loading.policies"
            class="elevation-1"
          >
            <template #[`item.actions`]="{ item }">
              <v-btn
                size="small"
                variant="text"
                icon="mdi-delete"
                color="error"
                :loading="loading.removePolicy"
                :title="$t('admin.removePolicy') || 'Remove Policy'"
                @click="removePolicy(item)"
              />
            </template>
          </v-data-table>
        </v-window-item>

        <!-- Groups Tab -->
        <v-window-item value="groups">
          <div class="d-flex justify-space-between align-center mb-4">
            <h3>{{ $t("admin.groupAssignments") || "Group Assignments" }}</h3>
            <v-btn
              color="primary"
              prepend-icon="mdi-plus"
              @click="showAddAssignment = true"
            >
              {{ $t("admin.addAssignment") || "Add Assignment" }}
            </v-btn>
          </div>

          <!-- Group Assignments Table -->
          <v-data-table
            :headers="assignmentHeaders"
            :items="groupAssignments"
            :loading="loading.assignments"
            class="elevation-1"
          >
            <template #[`item.actions`]="{ item }">
              <v-btn
                size="small"
                variant="text"
                icon="mdi-delete"
                color="error"
                :loading="loading.removeAssignment"
                :title="$t('admin.removeAssignment') || 'Remove Assignment'"
                @click="removeAssignment(item)"
              />
            </template>
          </v-data-table>
        </v-window-item>
      </v-window>
    </v-card-text>

    <!-- Add Policy Dialog -->
    <v-dialog v-model="showAddPolicy" max-width="500px">
      <v-card>
        <v-card-title>
          <span class="text-h5">{{
            $t("admin.addNewPolicy") || "Add New Policy"
          }}</span>
        </v-card-title>
        <v-card-text>
          <v-form ref="policyForm" v-model="validPolicy">
            <v-select
              v-model="newPolicy.subject"
              :items="availableGroups"
              item-title="name"
              item-value="name"
              :label="$t('admin.subject') || 'Subject (Group)'"
              :rules="[(v) => !!v || 'Subject is required']"
              required
            />
            <v-text-field
              v-model="newPolicy.object"
              :label="$t('admin.resource') || 'Resource'"
              :rules="[(v) => !!v || 'Resource is required']"
              required
            />
            <v-text-field
              v-model="newPolicy.action"
              :label="$t('admin.action') || 'Action'"
              :rules="[(v) => !!v || 'Action is required']"
              required
            />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="showAddPolicy = false">
            {{ $t("admin.cancel") || "Cancel" }}
          </v-btn>
          <v-btn
            color="primary"
            :loading="loading.addPolicy"
            :disabled="!validPolicy"
            @click="addPolicy"
          >
            {{ $t("admin.add") || "Add" }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Add Assignment Dialog -->
    <v-dialog v-model="showAddAssignment" max-width="500px">
      <v-card>
        <v-card-title>
          <span class="text-h5">{{
            $t("admin.addGroupAssignment") || "Add Group Assignment"
          }}</span>
        </v-card-title>
        <v-card-text>
          <v-form ref="assignmentForm" v-model="validAssignment">
            <v-select
              v-model="newAssignment.userEmail"
              :items="users"
              item-title="email"
              item-value="email"
              :label="$t('admin.user') || 'User'"
              :rules="[(v) => !!v || 'User is required']"
              required
            />
            <v-select
              v-model="newAssignment.group"
              :items="availableGroups"
              item-title="name"
              item-value="name"
              :label="$t('admin.group') || 'Group'"
              :rules="[(v) => !!v || 'Group is required']"
              required
            />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="showAddAssignment = false">
            {{ $t("admin.cancel") || "Cancel" }}
          </v-btn>
          <v-btn
            color="primary"
            :loading="loading.addAssignment"
            :disabled="!validAssignment"
            @click="addAssignment"
          >
            {{ $t("admin.add") || "Add" }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- User Edit Dialog -->
    <v-dialog v-model="showEditUser" max-width="600px">
      <v-card v-if="editingUser">
        <v-card-title>
          <span class="text-h5"
            >{{ $t("admin.editUser") || "Edit User" }}:
            {{ editingUser.email }}</span
          >
        </v-card-title>
        <v-card-text>
          <h4 class="mb-3">
            {{ $t("admin.currentGroups") || "Current Groups" }}
          </h4>
          <v-chip-group>
            <v-chip
              v-for="group in editingUser.groups"
              :key="group"
              closable
              color="primary"
              @click:close="removeUserGroup(editingUser.email, group)"
            >
              {{ group }}
            </v-chip>
          </v-chip-group>

          <h4 class="mt-4 mb-3">
            {{ $t("admin.availableGroups") || "Available Groups" }}
          </h4>
          <v-chip-group>
            <v-chip
              v-for="group in getAvailableGroupsForUser(editingUser)"
              :key="group.name"
              variant="outlined"
              color="success"
              @click="addUserGroup(editingUser.email, group.name)"
            >
              <v-icon start>mdi-plus</v-icon>
              {{ group.name }}
            </v-chip>
          </v-chip-group>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="showEditUser = false">
            {{ $t("admin.close") || "Close" }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import api from "@/services/api";

const { t } = useI18n();

// Component state
const activeTab = ref("users");
const showAddPolicy = ref(false);
const showAddAssignment = ref(false);
const showEditUser = ref(false);
const validPolicy = ref(false);
const validAssignment = ref(false);

// Data
const users = ref([]);
const policies = ref([]);
const groupAssignments = ref([]);
const availableGroups = ref([]);
const availableRoles = ref([]);
const editingUser = ref(null);

// Loading states
const loading = reactive({
  users: false,
  policies: false,
  assignments: false,
  refresh: false,
  addPolicy: false,
  removePolicy: false,
  addAssignment: false,
  removeAssignment: false,
});

// New item forms
const newPolicy = reactive({
  subject: "",
  object: "",
  action: "",
});

const newAssignment = reactive({
  userEmail: "",
  group: "",
});

// Table headers
const userHeaders = [
  { title: t("admin.email") || "Email", key: "email" },
  { title: t("admin.name") || "Name", key: "fullName" },
  { title: t("admin.groups") || "Groups", key: "groups", sortable: false },
  { title: t("admin.roles") || "Roles", key: "roles", sortable: false },
  { title: t("admin.department") || "Department", key: "department" },
  { title: t("admin.actions") || "Actions", key: "actions", sortable: false },
];

const policyHeaders = [
  { title: t("admin.subject") || "Subject", key: "subject" },
  { title: t("admin.resource") || "Resource", key: "object" },
  { title: t("admin.action") || "Action", key: "action" },
  { title: t("admin.actions") || "Actions", key: "actions", sortable: false },
];

const assignmentHeaders = [
  { title: t("admin.user") || "User", key: "user" },
  { title: t("admin.group") || "Group", key: "group" },
  { title: t("admin.actions") || "Actions", key: "actions", sortable: false },
];

// Methods
const refreshData = async () => {
  loading.refresh = true;
  try {
    await Promise.all([fetchUsers(), fetchPolicies()]);
  } finally {
    loading.refresh = false;
  }
};

const fetchUsers = async () => {
  loading.users = true;
  try {
    const response = await api.get("/api/admin/users");
    users.value = response.data.data.users || [];
    availableGroups.value = response.data.data.groups || [];
    availableRoles.value = response.data.data.roles || [];
  } catch (error) {
    console.error("Failed to fetch users:", error);
    if (error.response?.status === 404) {
      console.warn(
        "Admin API endpoints not available. Server may need restart.",
      );
    }
  } finally {
    loading.users = false;
  }
};

const fetchPolicies = async () => {
  loading.policies = true;
  try {
    const response = await api.get("/api/admin/policies");
    policies.value = response.data.data.policies || [];
    groupAssignments.value = response.data.data.groupings || [];
  } catch (error) {
    console.error("Failed to fetch policies:", error);
    if (error.response?.status === 404) {
      console.warn(
        "Admin API endpoints not available. Server may need restart.",
      );
    }
  } finally {
    loading.policies = false;
  }
};

const addPolicy = async () => {
  loading.addPolicy = true;
  try {
    await api.post("/api/admin/policies", newPolicy);

    // Reset form
    Object.assign(newPolicy, { subject: "", object: "", action: "" });
    showAddPolicy.value = false;

    // Refresh policies
    await fetchPolicies();
  } catch (error) {
    console.error("Failed to add policy:", error);
  } finally {
    loading.addPolicy = false;
  }
};

const removePolicy = async (policy) => {
  loading.removePolicy = true;
  try {
    await api.delete("/api/admin/policies", { data: policy });
    await fetchPolicies();
  } catch (error) {
    console.error("Failed to remove policy:", error);
  } finally {
    loading.removePolicy = false;
  }
};

const addAssignment = async () => {
  loading.addAssignment = true;
  try {
    await api.post("/api/admin/user-groups", newAssignment);

    // Reset form
    Object.assign(newAssignment, { userEmail: "", group: "" });
    showAddAssignment.value = false;

    // Refresh data
    await Promise.all([fetchUsers(), fetchPolicies()]);
  } catch (error) {
    console.error("Failed to add assignment:", error);
  } finally {
    loading.addAssignment = false;
  }
};

const removeAssignment = async (assignment) => {
  loading.removeAssignment = true;
  try {
    await api.delete("/api/admin/user-groups", {
      data: {
        userEmail: assignment.user,
        group: assignment.group,
      },
    });
    await Promise.all([fetchUsers(), fetchPolicies()]);
  } catch (error) {
    console.error("Failed to remove assignment:", error);
  } finally {
    loading.removeAssignment = false;
  }
};

const editUser = (user) => {
  editingUser.value = { ...user };
  showEditUser.value = true;
};

const addUserGroup = async (userEmail, group) => {
  try {
    await api.post("/api/admin/user-groups", { userEmail, group });
    await refreshData();

    // Update editing user
    if (editingUser.value && editingUser.value.email === userEmail) {
      editingUser.value.groups.push(group);
    }
  } catch (error) {
    console.error("Failed to add user to group:", error);
  }
};

const removeUserGroup = async (userEmail, group) => {
  try {
    await api.delete("/api/admin/user-groups", {
      data: { userEmail, group },
    });
    await refreshData();

    // Update editing user
    if (editingUser.value && editingUser.value.email === userEmail) {
      editingUser.value.groups = editingUser.value.groups.filter(
        (g) => g !== group,
      );
    }
  } catch (error) {
    console.error("Failed to remove user from group:", error);
  }
};

const getAvailableGroupsForUser = (user) => {
  return availableGroups.value.filter(
    (group) => !user.groups.includes(group.name),
  );
};

// Initialize
onMounted(async () => {
  await refreshData();
});
</script>

<style scoped>
.v-data-table {
  border-radius: 8px;
}

.v-chip-group {
  flex-wrap: wrap;
}

.v-tab {
  text-transform: none;
}
</style>
