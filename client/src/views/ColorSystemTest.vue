<template>
  <v-container fluid class="color-system-test">
    <!-- Header -->
    <v-row>
      <v-col cols="12">
        <div class="d-flex justify-space-between align-center mb-4">
          <div>
            <h1 class="text-h4">
              <v-icon style="margin-inline-end: 8px" color="primary">mdi-palette</v-icon>
              Color System Test Page
            </h1>
            <p class="text-subtitle-1 text-medium-emphasis">
              Enterprise Color System Showcase - Material Design 3
            </p>
          </div>
          <v-btn-toggle v-model="themeMode" mandatory>
            <v-btn value="light">
              <v-icon start>mdi-white-balance-sunny</v-icon>
              Light
            </v-btn>
            <v-btn value="dark">
              <v-icon start>mdi-weather-night</v-icon>
              Dark
            </v-btn>
          </v-btn-toggle>
        </div>
      </v-col>
    </v-row>

    <!-- Primary Colors -->
    <v-row>
      <v-col cols="12">
        <v-card elevation="2" class="mb-4">
          <v-card-title class="bg-primary text-white">
            <v-icon style="margin-inline-end: 8px">mdi-palette-outline</v-icon>
            Primary Colors (Orange Brand)
          </v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12" md="3" v-for="shade in primaryShades" :key="shade.name">
                <div 
                  class="color-swatch"
                  :style="{ backgroundColor: shade.color }"
                >
                  <div class="color-info">
                    <div class="color-name">{{ shade.name }}</div>
                    <div class="color-hex">{{ shade.color }}</div>
                  </div>
                </div>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Secondary Colors -->
    <v-row>
      <v-col cols="12">
        <v-card elevation="2" class="mb-4">
          <v-card-title class="bg-secondary text-white">
            <v-icon style="margin-inline-end: 8px">mdi-palette-outline</v-icon>
            Secondary Colors (Blue)
          </v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12" md="3" v-for="shade in secondaryShades" :key="shade.name">
                <div 
                  class="color-swatch"
                  :style="{ backgroundColor: shade.color }"
                >
                  <div class="color-info">
                    <div class="color-name">{{ shade.name }}</div>
                    <div class="color-hex">{{ shade.color }}</div>
                  </div>
                </div>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Semantic Colors -->
    <v-row>
      <v-col cols="12">
        <v-card elevation="2" class="mb-4">
          <v-card-title>
            <v-icon style="margin-inline-end: 8px" color="primary">mdi-information-outline</v-icon>
            Semantic Colors
          </v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12" md="3" v-for="semantic in semanticColors" :key="semantic.name">
                <v-card 
                  :color="semantic.color" 
                  class="semantic-card"
                  elevation="1"
                >
                  <v-card-text class="text-center">
                    <v-icon size="40" color="white" class="mb-2">{{ semantic.icon }}</v-icon>
                    <div class="text-h6 font-weight-bold text-white">{{ semantic.name }}</div>
                    <div class="text-caption text-white">{{ semantic.hex }}</div>
                    <div class="text-body-2 text-white mt-2">{{ semantic.usage }}</div>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Buttons Showcase -->
    <v-row>
      <v-col cols="12">
        <v-card elevation="2" class="mb-4">
          <v-card-title>
            <v-icon style="margin-inline-end: 8px" color="primary">mdi-gesture-tap</v-icon>
            Buttons
          </v-card-title>
          <v-card-text>
            <div class="mb-4">
              <div class="text-subtitle-2 mb-2">Primary Buttons</div>
              <div class="d-flex flex-wrap gap-2">
                <v-btn color="primary" variant="elevated">Elevated</v-btn>
                <v-btn color="primary" variant="flat">Flat</v-btn>
                <v-btn color="primary" variant="outlined">Outlined</v-btn>
                <v-btn color="primary" variant="text">Text</v-btn>
                <v-btn color="primary" variant="tonal">Tonal</v-btn>
              </div>
            </div>
            <div class="mb-4">
              <div class="text-subtitle-2 mb-2">Secondary Buttons</div>
              <div class="d-flex flex-wrap gap-2">
                <v-btn color="secondary" variant="elevated">Elevated</v-btn>
                <v-btn color="secondary" variant="flat">Flat</v-btn>
                <v-btn color="secondary" variant="outlined">Outlined</v-btn>
                <v-btn color="secondary" variant="text">Text</v-btn>
              </div>
            </div>
            <div class="mb-4">
              <div class="text-subtitle-2 mb-2">Semantic Buttons</div>
              <div class="d-flex flex-wrap gap-2">
                <v-btn color="success">Success</v-btn>
                <v-btn color="warning">Warning</v-btn>
                <v-btn color="error">Error</v-btn>
                <v-btn color="info">Info</v-btn>
              </div>
            </div>
            <div>
              <div class="text-subtitle-2 mb-2">Button Sizes</div>
              <div class="d-flex flex-wrap gap-2 align-center">
                <v-btn color="primary" size="x-small">X-Small</v-btn>
                <v-btn color="primary" size="small">Small</v-btn>
                <v-btn color="primary" size="default">Default</v-btn>
                <v-btn color="primary" size="large">Large</v-btn>
                <v-btn color="primary" size="x-large">X-Large</v-btn>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Status Chips -->
    <v-row>
      <v-col cols="12">
        <v-card elevation="2" class="mb-4">
          <v-card-title>
            <v-icon style="margin-inline-end: 8px" color="primary">mdi-label-outline</v-icon>
            Status Chips & Indicators
          </v-card-title>
          <v-card-text>
            <div class="mb-4">
              <div class="text-subtitle-2 mb-2">Semantic Status Chips</div>
              <div class="d-flex flex-wrap gap-2">
                <v-chip color="success" size="small" variant="flat" prepend-icon="mdi-check-circle-outline">
                  Success
                </v-chip>
                <v-chip color="warning" size="small" variant="flat" prepend-icon="mdi-alert-outline">
                  Warning
                </v-chip>
                <v-chip color="error" size="small" variant="flat" prepend-icon="mdi-close-circle-outline">
                  Error
                </v-chip>
                <v-chip color="info" size="small" variant="flat" prepend-icon="mdi-information-outline">
                  Info
                </v-chip>
              </div>
            </div>
            <div class="mb-4">
              <div class="text-subtitle-2 mb-2">Payment Status (Surgical Guide)</div>
              <div class="d-flex flex-wrap gap-2">
                <v-chip color="#43A047" size="small" variant="flat" prepend-icon="mdi-gift-outline">
                  Free
                </v-chip>
                <v-chip color="#1565C0" size="small" variant="flat" prepend-icon="mdi-ticket-confirmation-outline">
                  Fully Prepaid
                </v-chip>
                <v-chip color="#E53935" size="small" variant="flat" prepend-icon="mdi-cash-clock-outline">
                  Fully Postpaid
                </v-chip>
                <v-chip color="#8E24AA" size="small" variant="flat" prepend-icon="mdi-cash-multiple-outline">
                  Partially Postpaid
                </v-chip>
              </div>
            </div>
            <div>
              <div class="text-subtitle-2 mb-2">Workflow Status</div>
              <div class="d-flex flex-wrap gap-2">
                <v-chip color="#E65100" size="small" variant="flat" prepend-icon="mdi-fire-outline">
                  Rush
                </v-chip>
                <v-chip color="#F44336" size="small" variant="flat" prepend-icon="mdi-pause-circle-outline">
                  On Hold
                </v-chip>
                <v-chip color="#616161" size="small" variant="flat" prepend-icon="mdi-check-circle-outline">
                  Confirmed
                </v-chip>
                <v-chip color="#43A047" size="small" variant="flat" prepend-icon="mdi-play-circle-outline">
                  Active
                </v-chip>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Icons Showcase -->
    <v-row>
      <v-col cols="12">
        <v-card elevation="2" class="mb-4">
          <v-card-title>
            <v-icon style="margin-inline-end: 8px" color="primary">mdi-shape-outline</v-icon>
            Icon Styles (Outline vs Filled)
          </v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12" md="6">
                <div class="text-subtitle-2 mb-3">Outline Icons (Recommended)</div>
                <div class="d-flex flex-wrap gap-4">
                  <div class="text-center">
                    <v-icon color="primary" size="24" class="mb-2">mdi-cart-outline</v-icon>
                    <div class="text-caption">Cart</div>
                  </div>
                  <div class="text-center">
                    <v-icon color="success" size="24" class="mb-2">mdi-check-circle-outline</v-icon>
                    <div class="text-caption">Success</div>
                  </div>
                  <div class="text-center">
                    <v-icon color="error" size="24" class="mb-2">mdi-close-circle-outline</v-icon>
                    <div class="text-caption">Error</div>
                  </div>
                  <div class="text-center">
                    <v-icon color="warning" size="24" class="mb-2">mdi-alert-outline</v-icon>
                    <div class="text-caption">Warning</div>
                  </div>
                  <div class="text-center">
                    <v-icon color="info" size="24" class="mb-2">mdi-information-outline</v-icon>
                    <div class="text-caption">Info</div>
                  </div>
                </div>
              </v-col>
              <v-col cols="12" md="6">
                <div class="text-subtitle-2 mb-3">Filled Icons (For Emphasis)</div>
                <div class="d-flex flex-wrap gap-4">
                  <div class="text-center">
                    <v-icon color="primary" size="24" class="mb-2">mdi-cart</v-icon>
                    <div class="text-caption">Cart</div>
                  </div>
                  <div class="text-center">
                    <v-icon color="success" size="24" class="mb-2">mdi-check-circle</v-icon>
                    <div class="text-caption">Success</div>
                  </div>
                  <div class="text-center">
                    <v-icon color="error" size="24" class="mb-2">mdi-close-circle</v-icon>
                    <div class="text-caption">Error</div>
                  </div>
                  <div class="text-center">
                    <v-icon color="warning" size="24" class="mb-2">mdi-alert</v-icon>
                    <div class="text-caption">Warning</div>
                  </div>
                  <div class="text-center">
                    <v-icon color="info" size="24" class="mb-2">mdi-information</v-icon>
                    <div class="text-caption">Info</div>
                  </div>
                </div>
              </v-col>
            </v-row>
            <v-divider class="my-4"></v-divider>
            <div>
              <div class="text-subtitle-2 mb-3">Icon Sizes</div>
              <div class="d-flex flex-wrap gap-4 align-center">
                <div class="text-center">
                  <v-icon color="primary" size="16" class="mb-2 d-block">mdi-star-outline</v-icon>
                  <div class="text-caption">16px (Small)</div>
                </div>
                <div class="text-center">
                  <v-icon color="primary" size="20" class="mb-2 d-block">mdi-star-outline</v-icon>
                  <div class="text-caption">20px (Default)</div>
                </div>
                <div class="text-center">
                  <v-icon color="primary" size="24" class="mb-2 d-block">mdi-star-outline</v-icon>
                  <div class="text-caption">24px (Medium)</div>
                </div>
                <div class="text-center">
                  <v-icon color="primary" size="32" class="mb-2 d-block">mdi-star-outline</v-icon>
                  <div class="text-caption">32px (Large)</div>
                </div>
                <div class="text-center">
                  <v-icon color="primary" size="40" class="mb-2 d-block">mdi-star-outline</v-icon>
                  <div class="text-caption">40px (X-Large)</div>
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Cards Showcase -->
    <v-row>
      <v-col cols="12">
        <v-card elevation="2" class="mb-4">
          <v-card-title>
            <v-icon style="margin-inline-end: 8px" color="primary">mdi-card-outline</v-icon>
            Cards & Surfaces
          </v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12" md="4">
                <v-card elevation="0" class="border-card mb-2">
                  <v-card-title class="bg-primary text-white">
                    Elevation 0
                  </v-card-title>
                  <v-card-text>
                    Card with border, no elevation
                  </v-card-text>
                </v-card>
              </v-col>
              <v-col cols="12" md="4">
                <v-card elevation="1" class="mb-2">
                  <v-card-title class="bg-secondary text-white">
                    Elevation 1
                  </v-card-title>
                  <v-card-text>
                    Subtle shadow for depth
                  </v-card-text>
                </v-card>
              </v-col>
              <v-col cols="12" md="4">
                <v-card elevation="2" class="mb-2">
                  <v-card-title class="bg-success text-white">
                    Elevation 2
                  </v-card-title>
                  <v-card-text>
                    Standard card elevation
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Table Example -->
    <v-row>
      <v-col cols="12">
        <v-card elevation="2" class="mb-4">
          <v-card-title class="bg-primary text-white">
            <v-icon style="margin-inline-end: 8px">mdi-table</v-icon>
            Table with New Color System
          </v-card-title>
          <v-card-text class="pa-0">
            <v-table>
              <thead>
                <tr class="bg-primary">
                  <th class="text-white">ID</th>
                  <th class="text-white">Status</th>
                  <th class="text-white">Payment</th>
                  <th class="text-white">Workflow</th>
                  <th class="text-white">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in tableData" :key="index">
                  <td>#{{ item.id }}</td>
                  <td>
                    <v-chip :color="item.statusColor" size="small" variant="flat">
                      {{ item.status }}
                    </v-chip>
                  </td>
                  <td>
                    <v-icon :color="item.paymentColor" size="20">{{ item.paymentIcon }}</v-icon>
                    <span class="ml-2">{{ item.payment }}</span>
                  </td>
                  <td>
                    <v-icon :color="item.workflowColor" size="20">{{ item.workflowIcon }}</v-icon>
                    <span class="ml-2">{{ item.workflow }}</span>
                  </td>
                  <td>
                    <v-btn size="small" color="primary" variant="text" prepend-icon="mdi-eye-outline">
                      View
                    </v-btn>
                  </td>
                </tr>
              </tbody>
            </v-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Alerts & Messages -->
    <v-row>
      <v-col cols="12">
        <v-card elevation="2" class="mb-4">
          <v-card-title>
            <v-icon style="margin-inline-end: 8px" color="primary">mdi-alert-box-outline</v-icon>
            Alerts & Messages
          </v-card-title>
          <v-card-text>
            <v-alert type="success" variant="tonal" class="mb-2">
              <v-icon start>mdi-check-circle-outline</v-icon>
              Success message with outline icon
            </v-alert>
            <v-alert type="warning" variant="tonal" class="mb-2">
              <v-icon start>mdi-alert-outline</v-icon>
              Warning message with outline icon
            </v-alert>
            <v-alert type="error" variant="tonal" class="mb-2">
              <v-icon start>mdi-close-circle-outline</v-icon>
              Error message with outline icon
            </v-alert>
            <v-alert type="info" variant="tonal">
              <v-icon start>mdi-information-outline</v-icon>
              Info message with outline icon
            </v-alert>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Text Colors -->
    <v-row>
      <v-col cols="12">
        <v-card elevation="2" class="mb-4">
          <v-card-title>
            <v-icon style="margin-inline-end: 8px" color="primary">mdi-format-color-text</v-icon>
            Text Colors
          </v-card-title>
          <v-card-text>
            <div class="mb-2">
              <span class="text-h6">Primary Text</span>
              <p class="text-body-1">This is primary text color - used for main content</p>
            </div>
            <div class="mb-2">
              <span class="text-h6 text-medium-emphasis">Secondary Text</span>
              <p class="text-body-2 text-medium-emphasis">This is secondary text color - used for hints and supporting text</p>
            </div>
            <div class="mb-2">
              <span class="text-h6 text-disabled">Disabled Text</span>
              <p class="text-body-2 text-disabled">This is disabled text color</p>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Background Colors -->
    <v-row>
      <v-col cols="12">
        <v-card elevation="2" class="mb-4">
          <v-card-title>
            <v-icon style="margin-inline-end: 8px" color="primary">mdi-format-paint</v-icon>
            Background Colors
          </v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12" md="4">
                <div class="bg-surface pa-4 rounded">
                  <div class="text-subtitle-2 mb-2">Surface Background</div>
                  <div class="text-caption">#FFFFFF (Light) / #1E1E1E (Dark)</div>
                </div>
              </v-col>
              <v-col cols="12" md="4">
                <div class="bg-default pa-4 rounded">
                  <div class="text-subtitle-2 mb-2">Default Background</div>
                  <div class="text-caption">#FAFAFA (Light) / #121212 (Dark)</div>
                </div>
              </v-col>
              <v-col cols="12" md="4">
                <div class="bg-elevated pa-4 rounded border">
                  <div class="text-subtitle-2 mb-2">Elevated Background</div>
                  <div class="text-caption">For modals, dropdowns</div>
                </div>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useTheme } from 'vuetify';

const theme = useTheme();
const themeMode = ref('light');

// Watch theme mode changes
watch(themeMode, (newVal) => {
  theme.global.name.value = newVal;
});

// Primary color shades
const primaryShades = computed(() => [
  { name: 'Light', color: '#FFB74D' },
  { name: 'Main', color: '#FF8C00' },
  { name: 'Dark', color: '#E65100' },
  { name: 'Darker', color: '#C62828' },
]);

// Secondary color shades
const secondaryShades = computed(() => [
  { name: 'Light', color: '#42A5F5' },
  { name: 'Main', color: '#1976D2' },
  { name: 'Dark', color: '#1565C0' },
  { name: 'Darker', color: '#0D47A1' },
]);

// Semantic colors
const semanticColors = computed(() => [
  {
    name: 'Success',
    color: '#43A047',
    hex: '#43A047',
    icon: 'mdi-check-circle-outline',
    usage: 'Positive actions, completed states'
  },
  {
    name: 'Warning',
    color: '#FFA000',
    hex: '#FFA000',
    icon: 'mdi-alert-outline',
    usage: 'Caution, pending states'
  },
  {
    name: 'Error',
    color: '#E53935',
    hex: '#E53935',
    icon: 'mdi-close-circle-outline',
    usage: 'Errors, destructive actions'
  },
  {
    name: 'Info',
    color: '#00897B',
    hex: '#00897B',
    icon: 'mdi-information-outline',
    usage: 'Informational messages'
  },
]);

// Table data for demonstration
const tableData = ref([
  {
    id: '1001',
    status: 'Active',
    statusColor: 'success',
    payment: 'Free',
    paymentColor: '#43A047',
    paymentIcon: 'mdi-gift-outline',
    workflow: 'Rush',
    workflowColor: '#E65100',
    workflowIcon: 'mdi-fire-outline'
  },
  {
    id: '1002',
    status: 'Confirmed',
    statusColor: 'grey',
    payment: 'Prepaid',
    paymentColor: '#1565C0',
    paymentIcon: 'mdi-ticket-confirmation-outline',
    workflow: 'Active',
    workflowColor: '#43A047',
    workflowIcon: 'mdi-play-circle-outline'
  },
  {
    id: '1003',
    status: 'On Hold',
    statusColor: 'error',
    payment: 'Postpaid',
    paymentColor: '#E53935',
    paymentIcon: 'mdi-cash-clock-outline',
    workflow: 'On Hold',
    workflowColor: '#F44336',
    workflowIcon: 'mdi-pause-circle-outline'
  },
  {
    id: '1004',
    status: 'Active',
    statusColor: 'success',
    payment: 'Partial',
    paymentColor: '#8E24AA',
    paymentIcon: 'mdi-cash-multiple-outline',
    workflow: 'Confirmed',
    workflowColor: '#616161',
    workflowIcon: 'mdi-check-circle-outline'
  },
]);
</script>

<style scoped>
.color-system-test {
  padding: 24px;
}

.color-swatch {
  height: 120px;
  border-radius: 8px;
  display: flex;
  align-items: flex-end;
  padding: 12px;
  margin-bottom: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
}

.color-swatch:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.color-info {
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 8px 12px;
  border-radius: 4px;
  width: 100%;
}

.color-name {
  font-weight: 600;
  font-size: 0.9rem;
}

.color-hex {
  font-size: 0.75rem;
  opacity: 0.9;
  font-family: monospace;
}

.semantic-card {
  min-height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.border-card {
  border: 1px solid rgba(0, 0, 0, 0.12);
}

.bg-surface {
  background-color: #FFFFFF;
  border: 1px solid #E0E0E0;
}

.bg-default {
  background-color: #FAFAFA;
  border: 1px solid #E0E0E0;
}

.bg-elevated {
  background-color: #FFFFFF;
  border: 1px solid #E0E0E0;
}

.v-theme--dark .bg-surface {
  background-color: #1E1E1E;
  border-color: #424242;
}

.v-theme--dark .bg-default {
  background-color: #121212;
  border-color: #424242;
}

.v-theme--dark .bg-elevated {
  background-color: #252525;
  border-color: #424242;
}

.gap-2 {
  gap: 8px;
}

.gap-4 {
  gap: 16px;
}
</style>

