<script setup lang="ts">
import { ref, computed } from 'vue'
import { icons } from 'lucide-vue-next'
import { X, Search } from 'lucide-vue-next'

// Props
interface Props {
  modelValue: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

// Estado
const isOpen = ref(false)
const searchQuery = ref('')
const selectedCategory = ref<string>('all')

// Categorias de ícones financeiros e gerais
const categories = {
  all: 'Todos',
  finance: 'Finanças',
  shopping: 'Compras',
  transport: 'Transporte',
  food: 'Alimentação',
  home: 'Casa',
  health: 'Saúde',
  entertainment: 'Lazer',
  work: 'Trabalho',
  education: 'Educação',
  nature: 'Natureza',
  weather: 'Clima',
  tools: 'Ferramentas',
  travel: 'Viagens',
  general: 'Geral'
}

// Mapeamento de ícones por categoria (nomes dos ícones do Lucide)
const iconsByCategory: Record<string, string[]> = {
  finance: [
    'Wallet', 'CreditCard', 'Banknote', 'Coins', 'PiggyBank',
    'TrendingUp', 'TrendingDown', 'Receipt', 'Calculator',
    'DollarSign', 'Euro', 'PoundSterling', 'BadgeDollarSign',
    'HandCoins', 'Landmark', 'ChartLine', 'ChartBar'
  ],
  shopping: [
    'ShoppingCart', 'ShoppingBag', 'Store', 'Tag',
    'Gift', 'Package', 'Truck', 'ReceiptText'
  ],
  transport: [
    'Car', 'Bus', 'Bike', 'Plane', 'Train', 'Ship',
    'Fuel', 'ParkingCircle', 'MapPin'
  ],
  food: [
    'UtensilsCrossed', 'Coffee', 'Pizza', 'Apple',
    'Salad', 'Beer', 'Wine', 'IceCream'
  ],
  home: [
    'Home', 'Bed', 'Sofa', 'Lightbulb', 'Droplets',
    'Zap', 'Wifi', 'Tv', 'Smartphone', 'Laptop'
  ],
  health: [
    'Heart', 'Activity', 'Stethoscope', 'Pill',
    'Syringe', 'Thermometer', 'Dumbbell', 'Bone'
  ],
  entertainment: [
    'Gamepad2', 'Film', 'Music', 'Headphones',
    'Camera', 'Ticket', 'PartyPopper', 'Plane'
  ],
  work: [
    'Briefcase', 'Building', 'Building2', 'Factory',
    'Laptop2', 'Phone', 'Mail', 'FileText'
  ],
  education: [
    'GraduationCap', 'BookOpen', 'Book', 'Library',
    'School', 'Pencil', 'PenTool', 'Notebook'
  ],
  nature: [
    'Leaf', 'TreePine', 'Tree', 'Sprout', 'Flower',
    'FlowerLotus', 'Bug', 'Bird', 'Fish', 'Squirrel',
    'Dog', 'Cat', 'Rabbit', 'Bone'
  ],
  weather: [
    'Sun', 'Moon', 'Cloud', 'CloudRain', 'CloudSnow',
    'CloudLightning', 'CloudSun', 'Wind', 'Snowflake',
    'Umbrella', 'Rainbow', 'Sparkles'
  ],
  tools: [
    'Wrench', 'Hammer', 'Screwdriver', 'Drill',
    'Scissors', 'Ruler', 'Paintbrush', 'Axe',
    'Shovel', 'Gauge', 'Cog', 'Nut'
  ],
  travel: [
    'Luggage', 'Backpack', 'Map', 'Compass', 'MapPin',
    'Navigation', 'Tent', 'Mountain', 'Palmtree',
    'Castle', 'Church', 'Landmark'
  ],
  general: [
    'Circle', 'Square', 'Star', 'Heart', 'Bookmark',
    'Flag', 'Calendar', 'Clock', 'Bell', 'Settings',
    'User', 'Users', 'Shield', 'Lock', 'Key'
  ]
}

// Todos os ícones disponíveis
const allIconNames = computed(() => {
  if (selectedCategory.value === 'all') {
    return Object.values(iconsByCategory).flat()
  }
  return iconsByCategory[selectedCategory.value] || []
})

// Ícones filtrados por busca
const filteredIcons = computed(() => {
  const query = searchQuery.value.toLowerCase()
  if (!query) return allIconNames.value

  return allIconNames.value.filter(name =>
    name.toLowerCase().includes(query)
  )
})

// Selecionar ícone
function selectIcon(iconName: string) {
  emit('update:modelValue', iconName)
  isOpen.value = false
}

// Obter componente do ícone
function getIconComponent(name: string) {
  return icons[name as keyof typeof icons]
}

// Verificar se é um emoji (mantém compatibilidade)
const isEmoji = computed(() => {
  // Se tem mais de 2 caracteres ou não é ASCII, provavelmente é emoji
  return props.modelValue && props.modelValue.length <= 2 && !/^[a-zA-Z]+$/.test(props.modelValue)
})

// Componente do ícone atual
const currentIconComponent = computed(() => {
  if (isEmoji.value) return null
  return getIconComponent(props.modelValue)
})
</script>

<template>
  <div class="relative">
    <!-- Botão de seleção -->
    <button
      type="button"
      @click="isOpen = !isOpen"
      class="flex items-center justify-center w-16 h-16 rounded-lg border-2 border-gray-300 hover:border-primary-500 transition-colors bg-white"
    >
      <component
        v-if="currentIconComponent"
        :is="currentIconComponent"
        :size="32"
        :stroke-width="2"
        class="text-gray-700"
      />
      <span v-else-if="isEmoji" class="text-3xl">{{ modelValue }}</span>
      <span v-else class="text-gray-400">?</span>
    </button>

    <!-- Modal de seleção -->
    <div
      v-if="isOpen"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      @click.self="isOpen = false"
    >
      <div class="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[80vh] flex flex-col">
        <!-- Header -->
        <div class="flex items-center justify-between p-4 border-b">
          <h3 class="text-lg font-semibold text-gray-900">Selecionar Ícone</h3>
          <button
            @click="isOpen = false"
            class="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X class="h-6 w-6" />
          </button>
        </div>

        <!-- Busca e Filtros -->
        <div class="p-4 border-b space-y-3">
          <!-- Busca -->
          <div class="relative">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Buscar ícone..."
              class="input pl-10"
            />
          </div>

          <!-- Categorias -->
          <div class="flex flex-wrap gap-2">
            <button
              v-for="(label, key) in categories"
              :key="key"
              @click="selectedCategory = key"
              :class="[
                'px-3 py-1 rounded-full text-sm font-medium transition-colors',
                selectedCategory === key
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              ]"
            >
              {{ label }}
            </button>
          </div>
        </div>

        <!-- Grade de Ícones -->
        <div class="flex-1 overflow-y-auto p-4">
          <div v-if="filteredIcons.length === 0" class="text-center py-8 text-gray-500">
            Nenhum ícone encontrado
          </div>
          <div v-else class="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2">
            <button
              v-for="iconName in filteredIcons"
              :key="iconName"
              @click="selectIcon(iconName)"
              :class="[
                'flex items-center justify-center p-3 rounded-lg transition-all hover:bg-gray-100',
                modelValue === iconName ? 'bg-primary-100 ring-2 ring-primary-500' : ''
              ]"
              :title="iconName"
            >
              <component
                :is="getIconComponent(iconName)"
                :size="24"
                :stroke-width="2"
                class="text-gray-700"
              />
            </button>
          </div>
        </div>

        <!-- Footer -->
        <div class="p-4 border-t bg-gray-50">
          <p class="text-sm text-gray-600 text-center">
            {{ filteredIcons.length }} ícones disponíveis
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

