import { prisma } from '../config/database';

/**
 * Mapeamento de emojis para ícones Lucide equivalentes
 * Baseado nos emojis mais comuns usados em categorias financeiras
 */
const emojiToLucideMap: Record<string, string> = {
  // Finanças e Dinheiro
  '💰': 'Coins',
  '💵': 'Banknote',
  '💴': 'Banknote',
  '💶': 'Euro',
  '💷': 'PoundSterling',
  '💸': 'TrendingDown',
  '💳': 'CreditCard',
  '💎': 'Gem',
  '🪙': 'Coins',
  '🏦': 'Landmark',
  '🏧': 'CreditCard',
  '💹': 'TrendingUp',
  '📈': 'TrendingUp',
  '📉': 'TrendingDown',
  '📊': 'BarChart',
  '💼': 'Briefcase',
  '🧾': 'Receipt',
  '🔖': 'Bookmark',
  '⚖️': 'Scale',

  // Alimentação e Bebidas
  '🍔': 'Beef',
  '🍕': 'Pizza',
  '🍝': 'UtensilsCrossed',
  '🍜': 'UtensilsCrossed',
  '🍱': 'UtensilsCrossed',
  '🍛': 'UtensilsCrossed',
  '🍗': 'Drumstick',
  '🥗': 'Salad',
  '🥙': 'Sandwich',
  '🌮': 'UtensilsCrossed',
  '🥪': 'Sandwich',
  '🍞': 'Croissant',
  '🥐': 'Croissant',
  '☕': 'Coffee',
  '🍵': 'Coffee',
  '🥤': 'Cup',
  '🍺': 'Beer',
  '🍷': 'Wine',
  '🧃': 'Milk',
  '🥛': 'Milk',
  '🍰': 'Cake',
  '🎂': 'Cake',
  '🍪': 'Cookie',
  '🍩': 'Donut',
  '🍨': 'IceCream',
  '🧁': 'Cake',
  '🍎': 'Apple',
  '🍊': 'Cherry',
  '🥕': 'Carrot',
  '🛒': 'ShoppingCart',
  '🏪': 'Store',
  '': 'Utensils',
  '🥄': 'UtensilsSpoon',
  '🔪': 'UtensilsKnife',

  // Transporte e Veículos
  '🚗': 'Car',
  '🚕': 'Car',
  '🚙': 'Car',
  '🚌': 'Bus',
  '🚎': 'Bus',
  '🏎️': 'Car',
  '🚓': 'Car',
  '🚑': 'Ambulance',
  '🛻': 'Truck',
  '🚚': 'Truck',
  '🚲': 'Bike',
  '🛵': 'Bike',
  '🏍️': 'Bike',
  '🚇': 'Train',
  '🚆': 'Train',
  '🚊': 'Train',
  '🚉': 'TrainTrack',
  '✈️': 'Plane',
  '🛫': 'PlaneTakeoff',
  '⛽': 'Fuel',
  '🅿️': 'ParkingCircle',
  '🚦': 'TrafficCone',
  '🗺️': 'Map',
  '🧭': 'Compass',

  // Moradia e Contas da Casa
  '🏠': 'Home',
  '🏡': 'Home',
  '🏘️': 'Building',
  '🏢': 'Building2',
  '🏬': 'Store',
  '🏨': 'Building',
  '🏛️': 'Landmark',
  '🏭': 'Factory',
  '🔑': 'Key',
  '🗝️': 'KeyRound',
  '🚪': 'DoorClosed',
  '🪟': 'SquareDashedBottom',
  '🛏️': 'Bed',
  '🛋️': 'Sofa',
  '🪑': 'Armchair',
  '🚿': 'ShowerHead',
  '🛁': 'Bath',
  '💡': 'Lightbulb',
  '🔌': 'Plug',
  '🔋': 'Battery',
  '⚡': 'Zap',
  '📺': 'Tv',
  '📻': 'Radio',
  '☎️': 'Phone',
  '📞': 'Phone',
  '🖥️': 'Monitor',
  '💻': 'Laptop',
  '⌨️': 'Keyboard',

  // Saúde e Bem-estar
  '💊': 'Pill',
  '💉': 'Syringe',
  '🩹': 'Bandage',
  '🩺': 'Stethoscope',
  '🌡️': 'Thermometer',
  '🏥': 'Hospital',
  '⚕️': 'Cross',
  '💪': 'Dumbbell',
  '🦷': 'Tooth',
  '👁️': 'Eye',
  '🧘': 'PersonStanding',
  '🏋️': 'Dumbbell',

  // Educação e Desenvolvimento
  '🎓': 'GraduationCap',
  '📚': 'Library',
  '📖': 'BookOpen',
  '📝': 'Pencil',
  '✏️': 'Pencil',
  '🖊️': 'Pen',
  '📄': 'FileText',
  '📃': 'FileText',
  '📋': 'Clipboard',
  '📁': 'Folder',
  '📂': 'FolderOpen',
  '🗂️': 'Archive',
  '📌': 'Pin',
  '📍': 'MapPin',
  '📎': 'Paperclip',
  '✂️': 'Scissors',

  // Lazer e Entretenimento
  '🎮': 'Gamepad2',
  '🕹️': 'Gamepad',
  '🎯': 'Target',
  '🎲': 'Dice1',
  '🎰': 'Casino',
  '🎪': 'Tent',
  '🎭': 'Theater',
  '🎬': 'Film',
  '🎤': 'Mic',
  '🎧': 'Headphones',
  '🎵': 'Music',
  '🎶': 'Music2',
  '🎹': 'Piano',
  '🎸': 'Guitar',
  '🎨': 'Palette',
  '🖼️': 'Frame',
  '🎟️': 'Ticket',
  '🎫': 'Ticket',
  '🏆': 'Trophy',
  '🥇': 'Medal',
  '⚽': 'Football',
  '🏀': 'Basketball',

  // Compras e Produtos
  '🛍️': 'ShoppingBag',
  '🎁': 'Gift',
  '🎀': 'Gift',
  '🎈': 'PartyPopper',
  '📦': 'Package',
  '📫': 'Mailbox',
  '✉️': 'Mail',
  '💌': 'Mail',
  '👕': 'Shirt',
  '👔': 'Shirt',
  '👗': 'Shirt',
  '👞': 'Footprints',
  '💍': 'Gem',

  // Tecnologia e Eletrônicos
  '📱': 'Smartphone',
  '⏰': 'Clock',
  '⏱️': 'Timer',
  '⌚': 'Watch',
  '🔦': 'Flashlight',
  '💾': 'Save',
  '💿': 'Disc',
  '📷': 'Camera',
  '📸': 'Camera',

  // Serviços e Profissionais
  '🔧': 'Wrench',
  '🔨': 'Hammer',
  '🪛': 'Wrench',
  '⚙️': 'Settings',
  '🛠️': 'Wrench',

  // Viagens e Turismo
  '🧳': 'Luggage',
  '🎒': 'Backpack',
  '🗿': 'Landmark',
  '🗽': 'Landmark',
  '🗼': 'Building',
  '🏰': 'Castle',
  '⛪': 'Church',
  '🏔️': 'Mountain',
  '🏖️': 'Palmtree',
  '🌋': 'Volcano',

  // Animais e Pets
  '🐶': 'Dog',
  '🐱': 'Cat',
  '🐭': 'Rat',
  '🐰': 'Rabbit',
  '🦊': 'Squirrel',
  '🐻': 'Bear',
  '🐵': 'Monkey',
  '🐔': 'Bird',
  '🐦': 'Bird',
  '🦆': 'Bird',
  '🐝': 'Bug',
  '🦋': 'Bug',

  // Natureza e Clima
  '☀️': 'Sun',
  '🌤️': 'CloudSun',
  '⛅': 'CloudSun',
  '🌥️': 'Cloud',
  '☁️': 'Cloud',
  '🌦️': 'CloudRain',
  '🌧️': 'CloudRain',
  '⛈️': 'CloudLightning',
  '🌩️': 'CloudLightning',
  '🌨️': 'CloudSnow',
  '❄️': 'Snowflake',
  '☃️': 'Snowflake',
  '🌬️': 'Wind',
  '🌈': 'Rainbow',
  '☔': 'Umbrella',
  '🌙': 'Moon',
  '⭐': 'Star',
  '🌟': 'Sparkles',
  '✨': 'Sparkles',
  '🌍': 'Globe',
  '🌎': 'Globe',
  '🌏': 'Globe',
  '🌱': 'Sprout',
  '🌿': 'Leaf',
  '🍀': 'Clover',
  '🌵': 'Cactus',
  '🌴': 'Palmtree',
  '🌳': 'Tree',
  '🌲': 'TreePine',

  // Símbolos e Diversos
  '❤️': 'Heart',
  '🧡': 'Heart',
  '💛': 'Heart',
  '💚': 'Heart',
  '💙': 'Heart',
  '💜': 'Heart',
  '🖤': 'Heart',
  '🤍': 'Heart',
  '💔': 'HeartCrack',
  '✅': 'CheckCircle',
  '❌': 'XCircle',
  '⭕': 'Circle',
  '🚫': 'Ban',
  '⛔': 'OctagonX',
  '💯': 'Percent',
  '❗': 'AlertCircle',
  '❓': 'HelpCircle',
};

/**
 * Converte um emoji para o nome do ícone Lucide equivalente
 */
function convertEmojiToLucide(emoji: string): string {
  return emojiToLucideMap[emoji] || 'Folder'; // Fallback para Folder
}

/**
 * Verifica se uma string é um emoji
 */
function isEmoji(str: string): boolean {
  if (!str) return false;
  // Se tem mais de 2 caracteres e não contém apenas letras, provavelmente é emoji
  return str.length <= 2 && !/^[a-zA-Z]+$/.test(str);
}

/**
 * Script principal de migração
 */
async function migrateCategoriesToLucide() {
  console.log('🚀 Iniciando migração de categorias para Lucide Icons...\n');

  try {
    // Buscar todas as categorias
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        icon: true,
      },
    });

    console.log(`📊 Total de categorias encontradas: ${categories.length}\n`);

    let migratedCount = 0;
    let skippedCount = 0;
    let notFoundCount = 0;

    for (const category of categories) {
      if (!category.icon) {
        console.log(`⚠️  Categoria "${category.name}" sem ícone - pulando`);
        skippedCount++;
        continue;
      }

      // Verificar se já é um nome de ícone Lucide
      if (!isEmoji(category.icon)) {
        console.log(`✓  Categoria "${category.name}" já usa Lucide (${category.icon}) - pulando`);
        skippedCount++;
        continue;
      }

      // Converter emoji para Lucide
      const lucideIcon = convertEmojiToLucide(category.icon);

      if (lucideIcon === 'Folder' && category.icon !== '📁') {
        console.log(`⚠️  Categoria "${category.name}": emoji "${category.icon}" não mapeado - usando Folder como fallback`);
        notFoundCount++;
      }

      // Atualizar categoria
      await prisma.category.update({
        where: { id: category.id },
        data: { icon: lucideIcon },
      });

      console.log(`✓  Migrado: "${category.name}" | ${category.icon} → ${lucideIcon}`);
      migratedCount++;
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ Migração concluída!\n');
    console.log(`📈 Estatísticas:`);
    console.log(`   - Total: ${categories.length}`);
    console.log(`   - Migradas: ${migratedCount}`);
    console.log(`   - Puladas (já Lucide): ${skippedCount - notFoundCount}`);
    console.log(`   - Sem mapeamento (usou fallback): ${notFoundCount}`);
    console.log('='.repeat(60) + '\n');
  } catch (error) {
    console.error('❌ Erro durante a migração:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Executar migração
if (require.main === module) {
  migrateCategoriesToLucide()
    .then(() => {
      console.log('🎉 Script finalizado com sucesso!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Erro fatal:', error);
      process.exit(1);
    });
}

export { migrateCategoriesToLucide, convertEmojiToLucide, isEmoji };
