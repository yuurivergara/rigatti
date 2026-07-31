import bcrypt from 'bcryptjs';
import { connectDb, disconnectDb } from './db/connect.js';
import { runAsSystem } from './tenant/context.js';
import { Company, slugify } from './modules/company/company.model.js';
import { User } from './modules/auth/user.model.js';
import { Product } from './modules/products/product.model.js';
import { Message } from './modules/chat/message.model.js';
import { Image } from './modules/images/image.model.js';

const PASSWORD = 'senha1234';

const image = (seed: string) => `https://picsum.photos/seed/${seed}/640/480?grayscale`;

const TENANTS = [
  {
    company: 'Rigatti Móveis',
    users: [
      { name: 'Ana Rigatti', email: 'admin@rigatti.com', role: 'admin' as const },
      { name: 'Bruno Costa', email: 'user@rigatti.com', role: 'user' as const },
    ],
    products: [
      ['Sofá Retrátil Toscana 3 Lugares', 'Sofá retrátil e reclinável em suede, assentos de espuma D33 e estrutura em madeira maciça de eucalipto.', 3499.9, 'Sofás', 12],
      ['Sofá Chesterfield Couro Caramelo', 'Couro legítimo com capitonê feito à mão e pés torneados em imbuia.', 8990, 'Sofás', 3],
      ['Mesa de Jantar Nórdica 6 Lugares', 'Tampo em carvalho natural de 1,80m com pés cônicos em madeira maciça.', 2799, 'Mesas', 8],
      ['Mesa de Centro Orgânica', 'Formato orgânico em MDF laqueado fosco com base em aço carbono preto.', 899.9, 'Mesas', 20],
      ['Cadeira Eames Estofada', 'Releitura da Eames com assento estofado em linho e base palito de madeira.', 449.9, 'Cadeiras', 60],
      ['Poltrona Charles Bergère', 'Poltrona alta com apoio de cabeça, revestimento em veludo esmeralda.', 1690, 'Cadeiras', 15],
      ['Estante Modular Vertical', 'Seis nichos em MDF amadeirado, montagem sem ferramentas.', 1250, 'Estantes', 18],
      ['Rack Bancada Suspenso 1,8m', 'Rack suspenso com porta basculante e passagem de cabos integrada.', 1099, 'Estantes', 10],
      ['Cama Box Queen Ortopédica', 'Conjunto box com molas ensacadas e pillow top de 5cm.', 3290, 'Camas', 7],
      ['Cabeceira Estofada King', 'Cabeceira king em veludo com moldura de madeira e fixação na parede.', 1180, 'Camas', 9],
      ['Buffet Escandinavo 4 Portas', 'Buffet em freijó com puxadores em latão escovado.', 2450, 'Armários', 5],
      ['Guarda-Roupa Casal 6 Portas', 'Guarda-roupa com espelho central, 6 portas e 4 gavetas com corrediças metálicas.', 2890, 'Armários', 6],
      ['Luminária de Piso Arco', 'Luminária arco com cúpula em alumínio e base em mármore Carrara.', 780, 'Iluminação', 22],
    ],
  },
  {
    company: 'TechNova Eletrônicos',
    users: [
      { name: 'Carla Menezes', email: 'admin@technova.com', role: 'admin' as const },
      { name: 'Diego Alves', email: 'user@technova.com', role: 'user' as const },
    ],
    products: [
      ['Notebook Aero 14 Ultra', 'Ultrabook de 14" com 32GB de RAM, SSD de 1TB e tela OLED 2.8K a 120Hz.', 8999, 'Notebooks', 11],
      ['Notebook Gamer Titan 16', 'Placa dedicada de 12GB, tela 16" 240Hz e sistema de refrigeração a vapor.', 12490, 'Notebooks', 4],
      ['Monitor UltraWide 34" Curvo', 'Monitor 34" curvo 3440x1440 a 165Hz com HDR400 e hub USB-C de 90W.', 3799, 'Monitores', 14],
      ['Monitor 27" 4K Profissional', 'Painel IPS 4K com 99% de cobertura sRGB e calibração de fábrica.', 2650, 'Monitores', 9],
      ['Teclado Mecânico Compact 75%', 'Layout 75% hot-swappable, switches lineares e conexão tripla (USB-C, BT, 2.4GHz).', 649.9, 'Periféricos', 40],
      ['Mouse Ergonômico Vertical', 'Mouse vertical sem fio com sensor de 8000 DPI e seis botões programáveis.', 289.9, 'Periféricos', 55],
      ['Headset Studio ANC', 'Headset over-ear com cancelamento ativo, 40h de bateria e codec LDAC.', 1290, 'Áudio', 25],
      ['Caixa de Som Portátil 60W', 'Caixa Bluetooth 60W à prova d\'água IP67 com 20h de autonomia.', 749, 'Áudio', 30],
      ['Smartphone Nova X5 256GB', 'Tela AMOLED de 6,7", câmera tripla de 50MP e carregamento de 80W.', 4299, 'Smartphones', 20],
      ['Smartphone Nova Lite 128GB', 'Modelo de entrada com bateria de 5000mAh e tela de 90Hz.', 1599, 'Smartphones', 35],
      ['Tablet Slate 11 Wi-Fi', 'Tablet de 11" com caneta ativa inclusa e 8GB de RAM.', 3190, 'Tablets', 13],
      ['SSD NVMe 2TB Gen4', 'SSD PCIe 4.0 com leitura de 7.000 MB/s e dissipador integrado.', 999, 'Armazenamento', 48],
      ['HD Externo 4TB USB-C', 'Disco externo de 4TB com criptografia por hardware e cabo USB-C.', 689, 'Armazenamento', 26],
    ],
  },
];

async function seed() {
  await connectDb();

  await Promise.all([
    Message.collection.deleteMany({}),
    Product.collection.deleteMany({}),
    Image.collection.deleteMany({}),
    User.deleteMany({}),
    Company.deleteMany({}),
  ]);

  const passwordHash = await bcrypt.hash(PASSWORD, 12);

  for (const tenant of TENANTS) {
    const company = await Company.create({ name: tenant.company, slug: slugify(tenant.company) });

    await User.insertMany(
      tenant.users.map((u) => ({ ...u, companyId: company._id, passwordHash })),
    );

    await runAsSystem(String(company._id), () =>
      Product.insertMany(
        tenant.products.map(([name, description, price, category, stock]) => ({
          name,
          description,
          price,
          category,
          stock,
          active: true,
          imageUrl: image(slugify(String(name))),
        })),
      ),
    );

    console.log(`${tenant.company}: ${tenant.products.length} produtos, ${tenant.users.length} usuários`);
  }

  console.log(`\nSenha de todos os usuários: ${PASSWORD}`);
  for (const tenant of TENANTS) {
    for (const user of tenant.users) console.log(`  ${user.role.padEnd(5)} ${user.email}`);
  }

  await disconnectDb();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
