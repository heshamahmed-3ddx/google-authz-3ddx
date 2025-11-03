<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1>Client Confirmation Page</h1>
        <v-alert type="success" class="mb-4"
          >Welcome, Client Confirmation group member!</v-alert
        >
        <v-card v-if="loading" class="pa-4 text-center">
          <v-progress-circular indeterminate color="primary" size="32" />
          <div class="mt-2">Loading group info...</div>
        </v-card>
        <v-card v-else class="pa-4">
          <h3 class="mb-2">Your Google Group Info</h3>
          <div v-if="groupInfo">
            <div><strong>Email:</strong> {{ groupInfo.email }}</div>
            <div><strong>Full Name:</strong> {{ groupInfo.fullName }}</div>
            <div>
              <strong>Groups:</strong>
              <v-chip
                v-for="group in groupInfo.groups"
                :key="group"
                class="mr-2 mb-2"
                color="primary"
                variant="flat"
                size="small"
              >
                {{ group }}
              </v-chip>
            </div>
            <div><strong>Org Unit:</strong> {{ groupInfo.orgUnit }}</div>
            <div><strong>Department:</strong> {{ groupInfo.department }}</div>
          </div>
          <div v-else class="text-error">Could not load group info.</div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { apiService } from "@/services/api";

const groupInfo = ref(null);
const loading = ref(true);

onMounted(async () => {
  try {
    const { data } = await apiService.get("/api/user/details");
    if (data && data.data) {
      groupInfo.value = data.data;
    }
  } catch (e) {
    groupInfo.value = null;
  } finally {
    loading.value = false;
  }
});
</script>
