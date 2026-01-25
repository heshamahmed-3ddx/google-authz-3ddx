<template>
  <div class="permissions-matrix">
    <v-alert type="info" variant="tonal" density="compact" class="mb-3">
      <div class="text-caption">
        <strong>Permissions Matrix:</strong> Shows which roles have access to
        which resources and actions.
        <span v-if="!readOnly">Click on a cell to toggle permissions.</span>
        <span v-else
          >You are viewing in read-only mode. Only administrators can modify
          permissions.</span
        >
      </div>
    </v-alert>

    <v-card variant="outlined" elevation="0">
      <v-card-text class="pa-3">
        <div v-if="loading" class="text-center py-8">
          <v-progress-circular
            indeterminate
            color="primary"
          ></v-progress-circular>
        </div>

        <div v-else-if="resources.length === 0" class="text-center py-8">
          <p class="text-body-2 text-medium-emphasis">
            No permissions data available
          </p>
        </div>

        <v-table v-else>
          <thead>
            <tr>
              <th class="text-left">Resource</th>
              <th v-for="action in actions" :key="action" class="text-center">
                {{ action }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="resource in resources" :key="resource">
              <td class="font-weight-medium">{{ resource }}</td>
              <td
                v-for="action in actions"
                :key="`${resource}-${action}`"
                class="text-center"
              >
                <v-checkbox
                  :model-value="hasPermission(resource, action)"
                  :disabled="readOnly"
                  density="compact"
                  hide-details
                  @update:model-value="togglePermission(resource, action)"
                ></v-checkbox>
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";

const props = defineProps({
  roles: {
    type: Array,
    default: () => [],
  },
  policies: {
    type: Array,
    default: () => [],
  },
  selectedRole: {
    type: String,
    default: null,
  },
  readOnly: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["permission-changed"]);

const loading = ref(false);

// Extract unique resources and actions from policies
const resources = computed(() => {
  const resourceSet = new Set();
  props.policies.forEach((policy) => {
    if (policy.object) resourceSet.add(policy.object);
  });
  return Array.from(resourceSet).sort();
});

const actions = computed(() => {
  const actionSet = new Set();
  props.policies.forEach((policy) => {
    if (policy.action) actionSet.add(policy.action);
  });
  return Array.from(actionSet).sort();
});

// Check if a permission exists
const hasPermission = (resource, action) => {
  if (!props.selectedRole) return false;
  return props.policies.some(
    (policy) =>
      policy.subject === props.selectedRole &&
      policy.object === resource &&
      policy.action === action,
  );
};

// Toggle permission
const togglePermission = async (resource, action) => {
  if (props.readOnly) {
    return; // Don't allow changes in read-only mode
  }

  if (!props.selectedRole) {
    // Show message to select a role first
    return;
  }

  const hasPerm = hasPermission(resource, action);

  emit("permission-changed", {
    role: props.selectedRole,
    resource,
    action,
    enabled: !hasPerm,
  });
};
</script>

<style scoped>
.permissions-matrix {
  overflow-x: auto;
}

.permissions-matrix :deep(.v-table) {
  min-width: 100%;
}
</style>
