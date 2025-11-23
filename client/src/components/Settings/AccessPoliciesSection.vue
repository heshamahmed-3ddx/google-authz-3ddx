<template>
  <div class="access-policies-section">
    <!-- Loading State -->
    <div v-if="loading" class="text-center py-8">
      <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
      <p class="mt-4 text-body-2">Loading policies...</p>
    </div>

    <!-- Error State -->
    <v-alert v-else-if="error" type="error" variant="tonal" density="compact" class="mb-3">
      <div class="text-caption">{{ error }}</div>
      <template #append>
        <v-btn variant="text" size="small" @click="loadPolicies">Retry</v-btn>
      </template>
    </v-alert>

    <!-- Content -->
    <div v-else>
      <!-- Actions Bar -->
      <div class="d-flex justify-space-between align-center mb-3">
        <v-text-field
          v-model="searchQuery"
          prepend-inner-icon="mdi-magnify-outline"
          label="Search policies"
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
          prepend-icon="mdi-file-plus"
          @click="showAddPolicyDialog = true"
        >
          Add Policy
        </v-btn>
      </div>

      <!-- Policies Table -->
      <v-card variant="outlined" elevation="0">
        <v-card-title class="text-subtitle-2 font-weight-medium pa-3" style="min-height: 36px;">
          Policies ({{ filteredPolicies.length }})
        </v-card-title>
        <v-data-table
          :headers="headers"
          :items="filteredPolicies"
          :items-per-page="10"
          class="elevation-0"
        >
          <template #item.subject="{ item }">
            <v-chip size="small" color="primary" variant="tonal">
              {{ item.subject }}
            </v-chip>
          </template>
          <template #item.object="{ item }">
            <v-chip size="small" color="secondary" variant="tonal">
              {{ item.object }}
            </v-chip>
          </template>
          <template #item.action="{ item }">
            <v-chip size="small" color="success" variant="tonal">
              {{ item.action }}
            </v-chip>
          </template>
          <template #item.actions="{ item }">
            <v-btn
              v-if="isAdmin"
              icon="mdi-pencil"
              variant="text"
              size="small"
              @click="editPolicy(item)"
            ></v-btn>
            <v-btn
              v-if="isAdmin"
              icon="mdi-delete"
              variant="text"
              size="small"
              color="error"
              @click="confirmDeletePolicy(item)"
            ></v-btn>
            <span v-else class="text-caption text-medium-emphasis">View Only</span>
          </template>
        </v-data-table>
      </v-card>
    </div>

    <!-- Add/Edit Policy Dialog -->
    <v-dialog v-model="showAddPolicyDialog" max-width="600">
      <v-card>
        <v-card-title>
          {{ editingPolicy ? "Edit Policy" : "Add New Policy" }}
        </v-card-title>
        <v-card-text>
          <v-select
            v-model="policyForm.subject"
            :items="availableSubjects"
            label="Subject (Role/Group)"
            variant="outlined"
            :rules="[rules.required]"
            :disabled="!isAdmin"
            class="mb-3"
          ></v-select>
          <v-text-field
            v-model="policyForm.object"
            label="Object (Resource)"
            variant="outlined"
            :rules="[rules.required]"
            :disabled="!isAdmin"
            class="mb-3"
          ></v-text-field>
          <v-select
            v-model="policyForm.action"
            :items="availableActions"
            label="Action"
            variant="outlined"
            :rules="[rules.required]"
            :disabled="!isAdmin"
          ></v-select>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="closePolicyDialog">Cancel</v-btn>
          <v-btn
            v-if="isAdmin"
            color="primary"
            @click="savePolicy"
            :loading="saving"
          >
            {{ editingPolicy ? "Update" : "Create" }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="showDeleteDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h6">Confirm Delete</v-card-title>
        <v-card-text>
          Are you sure you want to delete this policy?
          <div class="mt-2">
            <strong>Subject:</strong> {{ policyToDelete?.subject }}<br />
            <strong>Resource:</strong> {{ policyToDelete?.object }}<br />
            <strong>Action:</strong> {{ policyToDelete?.action }}
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="showDeleteDialog = false">Cancel</v-btn>
          <v-btn color="error" @click="deletePolicy" :loading="deleting">
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
const policies = ref([]);
const searchQuery = ref("");
const showAddPolicyDialog = ref(false);
const showDeleteDialog = ref(false);
const editingPolicy = ref(null);
const policyToDelete = ref(null);
const saving = ref(false);
const deleting = ref(false);

// Form
const policyForm = ref({
  subject: "",
  object: "",
  action: "",
});

// Available options
const availableActions = ["read", "write", "create", "delete", "update", "approve", "manage"];
const availableSubjects = ref([]);

// Table headers
const headers = [
  { title: "Subject", key: "subject", sortable: true },
  { title: "Resource", key: "object", sortable: true },
  { title: "Action", key: "action", sortable: true },
  { title: "Actions", key: "actions", sortable: false, align: "end" },
];

// Validation rules
const rules = {
  required: (value) => !!value || "This field is required",
};

// Computed
const filteredPolicies = computed(() => {
  if (!searchQuery.value) return policies.value;
  const query = searchQuery.value.toLowerCase();
  return policies.value.filter(
    (policy) =>
      policy.subject.toLowerCase().includes(query) ||
      policy.object.toLowerCase().includes(query) ||
      policy.action.toLowerCase().includes(query)
  );
});

// Methods
const loadPolicies = async () => {
  loading.value = true;
  error.value = null;
  try {
    // Load policies
    const response = await apiService.get("/api/admin/policies");
    if (response.data?.data?.policies) {
      policies.value = response.data.data.policies.map((p) => ({
        subject: p.subject,
        object: p.object,
        action: p.action,
      }));
    }

    // Load available subjects (groups/roles)
    const usersResponse = await apiService.get("/api/admin/users");
    if (usersResponse.data?.data?.groups) {
      availableSubjects.value = usersResponse.data.data.groups.map((g) => g.name || g);
    }
    if (usersResponse.data?.data?.roles) {
      const roles = usersResponse.data.data.roles.map((r) => r.name || r);
      availableSubjects.value = [...availableSubjects.value, ...roles];
    }
  } catch (err) {
    error.value = err.response?.data?.error?.message || "Failed to load policies";
    showSnackbar("Error loading policies", "error");
  } finally {
    loading.value = false;
  }
};

const editPolicy = (policy) => {
  if (!props.isAdmin) return; // Prevent editing for non-admins
  editingPolicy.value = policy;
  policyForm.value = {
    subject: policy.subject,
    object: policy.object,
    action: policy.action,
  };
  showAddPolicyDialog.value = true;
};

const closePolicyDialog = () => {
  showAddPolicyDialog.value = false;
  editingPolicy.value = null;
  policyForm.value = {
    subject: "",
    object: "",
    action: "",
  };
};

const savePolicy = async () => {
  if (!policyForm.value.subject || !policyForm.value.object || !policyForm.value.action) {
    return;
  }

  saving.value = true;
  try {
    if (editingPolicy.value) {
      // Update policy (delete old, add new)
      await apiService.delete("/api/admin/policies", {
        data: {
          subject: editingPolicy.value.subject,
          object: editingPolicy.value.object,
          action: editingPolicy.value.action,
        },
      });
    }

    // Add new policy
    await apiService.post("/api/admin/policies", {
      subject: policyForm.value.subject,
      object: policyForm.value.object,
      action: policyForm.value.action,
    });

    showSnackbar(
      editingPolicy.value ? "Policy updated successfully" : "Policy created successfully",
      "success"
    );
    closePolicyDialog();
    await loadPolicies();
  } catch (err) {
    showSnackbar(
      err.response?.data?.error?.message || "Failed to save policy",
      "error"
    );
  } finally {
    saving.value = false;
  }
};

const confirmDeletePolicy = (policy) => {
  policyToDelete.value = policy;
  showDeleteDialog.value = true;
};

const deletePolicy = async () => {
  if (!policyToDelete.value) return;

  deleting.value = true;
  try {
    await apiService.delete("/api/admin/policies", {
      data: {
        subject: policyToDelete.value.subject,
        object: policyToDelete.value.object,
        action: policyToDelete.value.action,
      },
    });

    showSnackbar("Policy deleted successfully", "success");
    showDeleteDialog.value = false;
    policyToDelete.value = null;
    await loadPolicies();
  } catch (err) {
    showSnackbar(
      err.response?.data?.error?.message || "Failed to delete policy",
      "error"
    );
  } finally {
    deleting.value = false;
  }
};

onMounted(() => {
  loadPolicies();
});
</script>

<style scoped>
.access-policies-section {
  min-height: 300px;
}
</style>

