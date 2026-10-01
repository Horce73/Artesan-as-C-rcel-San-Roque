import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../entities/user.entity';
import { Workshop } from '../entities/workshop.entity';
import { Artisan } from '../entities/artisan.entity';
import { Category } from '../entities/category.entity';
import { Product, ProductStatus } from '../entities/product.entity';
import { InventoryBatch } from '../entities/inventory-batch.entity';
import { TraceabilityEvent, TraceabilityStage } from '../entities/traceability-event.entity';

@Injectable()
export class SeederService implements OnModuleInit {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Workshop) private workshopRepo: Repository<Workshop>,
    @InjectRepository(Artisan) private artisanRepo: Repository<Artisan>,
    @InjectRepository(Category) private categoryRepo: Repository<Category>,
    @InjectRepository(Product) private productRepo: Repository<Product>,
    @InjectRepository(InventoryBatch) private batchRepo: Repository<InventoryBatch>,
    @InjectRepository(TraceabilityEvent) private eventRepo: Repository<TraceabilityEvent>,
  ) {}

  async onModuleInit() {
    await this.seedUsers();
    await this.seedWorkshopsAndArtisans();
    await this.seedCategories();
    await this.seedProductsAndTraceability();
    await this.seedCatalogAdditions();
    await this.fixPlaceholderProductImages();
    await this.fixPlaceholderCategoryImages();
    await this.fixTextileArtisan();
  }

  private async seedUsers() {
    const count = await this.userRepo.count();
    if (count === 0) {
      const passwordHash = await bcrypt.hash('admin123', 10);
      const admin = this.userRepo.create({
        email: 'admin@sanroque.bo',
        passwordHash,
        fullName: 'Administrador San Roque',
        role: UserRole.ADMIN,
        isActive: true,
      });
      await this.userRepo.save(admin);
      console.log('Seeded Admin User: admin@sanroque.bo / admin123');
    }
  }

  private async seedWorkshopsAndArtisans() {
    const count = await this.workshopRepo.count();
    if (count === 0) {
      const carp = await this.workshopRepo.save(
        this.workshopRepo.create({
          code: 'CARP',
          name: 'Taller de Carpintería y Ebanistería',
          description: 'Especializado en muebles de cedro y tajibo, baúles chuquisaqueños, tallados a mano y objetos decorativos de alta durabilidad.',
          icon: 'hammer',
        }),
      );

      const talab = await this.workshopRepo.save(
        this.workshopRepo.create({
          code: 'TALAB',
          name: 'Taller de Talabartería y Marroquinería',
          description: 'Confección artesanal en cuero 100% legítimo: billeteras, cinturones, portafolios y accesorios con finos acabados repujados.',
          icon: 'briefcase',
        }),
      );

      const tej = await this.workshopRepo.save(
        this.workshopRepo.create({
          code: 'TEJ',
          name: 'Taller de Tejidos y Arte Textil',
          description: 'Elaboración de prendas en lana de alpaca y oveja en telares tradicionales, rescatando iconografía andina y chuquisaqueña.',
          icon: 'scissors',
        }),
      );

      const pint = await this.workshopRepo.save(
        this.workshopRepo.create({
          code: 'PINT',
          name: 'Taller de Pintura y Escultura Virreinal',
          description: 'Restauración y creación de cuadros al óleo con temática colonial, pan de oro y relicarios tallados.',
          icon: 'palette',
        }),
      );

      // Artisans
      await this.artisanRepo.save([
        this.artisanRepo.create({
          workshopId: carp.id,
          aliasCode: 'Maestro Don Jorge - Taller Carpintería',
          bioImpactStory: 'Don Jorge perfeccionó la técnica del tallado virreinal chuquisaqueño en San Roque, capacitando a más de 15 compañeros en el oficio de la ebanistería.',
          yearsInWorkshop: 4,
        }),
        this.artisanRepo.create({
          workshopId: talab.id,
          aliasCode: 'Artesano Carlos - Taller Marroquinería',
          bioImpactStory: 'Especialista en repujado en cuero vacuno. Su trabajo sostiene el sustento de su familia mientras adquiere herramientas para su futuro taller independiente.',
          yearsInWorkshop: 3,
        }),
        this.artisanRepo.create({
          workshopId: tej.id,
          aliasCode: 'Maestro Elías - Taller Textil',
          bioImpactStory: 'Experto en el telar de pedales e hilado en rueca. Sus telares rescatan patrones ancestrales de Jalq\'a y Tarabuco.',
          yearsInWorkshop: 5,
        }),
      ]);
    }
  }

  private async seedCategories() {
    const count = await this.categoryRepo.count();
    if (count === 0) {
      await this.categoryRepo.save([
        this.categoryRepo.create({
          name: 'Madera y Tallado',
          slug: 'madera-tallado',
          description: 'Cofres, baúles, esculturas y accesorios de madera fina tallada a mano.',
          imageUrl: '/assets/images/barco.jpg',
        }),
        this.categoryRepo.create({
          name: 'Cuero y Marroquinería',
          slug: 'cuero-marroquineria',
          description: 'Carteras, billeteras, cinturones repujados y estuches de cuero genuino.',
          imageUrl: '/assets/images/portafolio.jpg',
        }),
        this.categoryRepo.create({
          name: 'Textiles y Tejidos',
          slug: 'textiles-tejidos',
          description: 'Ponchos, bufandas, aguayos y chalinas tejidas artesanalmente.',
          imageUrl: 'https://images.unsplash.com/photo-1606760227091-3dd858d9721b?auto=format&fit=crop&w=800&q=80',
        }),
        this.categoryRepo.create({
          name: 'Arte Virreinal y Pintura',
          slug: 'arte-pintura',
          description: 'Lienzos al óleo con marcos tallados en pan de oro y pintura colonial.',
          imageUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80',
        }),
      ]);
    }
  }

  private async seedProductsAndTraceability() {
    const count = await this.productRepo.count();
    if (count === 0) {
      const carp = await this.workshopRepo.findOne({ where: { code: 'CARP' } });
      const talab = await this.workshopRepo.findOne({ where: { code: 'TALAB' } });
      const tej = await this.workshopRepo.findOne({ where: { code: 'TEJ' } });

      const catMadera = await this.categoryRepo.findOne({ where: { slug: 'madera-tallado' } });
      const catCuero = await this.categoryRepo.findOne({ where: { slug: 'cuero-marroquineria' } });
      const catTextil = await this.categoryRepo.findOne({ where: { slug: 'textiles-tejidos' } });

      const artisans = await this.artisanRepo.find();

      // Product 1
      const prod1 = await this.productRepo.save(
        this.productRepo.create({
          title: 'Cofre Colonial Chuquisaqueño en Cedro',
          description: 'Cofre de madera de cedro seleccionada con herrajes de fierro forjado y tallado artesanal barroco. Pieza ideal para obsequio o decoración elegante.',
          price: 380.00,
          sku: 'SR-CARP-COF-01',
          categoryId: catMadera?.id,
          workshopId: carp?.id,
          artisanId: artisans[0]?.id,
          imageUrls: [
            '/assets/images/baul.jpg',
          ],
          stock: 3,
          status: ProductStatus.AVAILABLE,
          isUniquePiece: true,
        }),
      );

      const batch1 = await this.batchRepo.save(
        this.batchRepo.create({
          productId: prod1.id,
          trackingCode: 'SR-CARP-2026-001',
          stockQuantity: 3,
          batchStatus: 'LISTO_CATALOGO',
        }),
      );

      await this.eventRepo.save([
        this.eventRepo.create({
          batchId: batch1.id,
          stage: TraceabilityStage.MATERIA_PRIMA,
          title: 'Selección de Madera de Cedro',
          description: 'Selección de maderas de cedro estacionadas de alta densidad del stock del taller.',
          loggedBy: 'Taller de Carpintería San Roque',
        }),
        this.eventRepo.create({
          batchId: batch1.id,
          stage: TraceabilityStage.ENSAMBLE_TALLADO,
          title: 'Tallado Barroco a Mano',
          description: 'El Maestro Don Jorge realizó los grabados florales virreinales chuquisaqueños.',
          loggedBy: 'Taller de Carpintería San Roque',
        }),
        this.eventRepo.create({
          batchId: batch1.id,
          stage: TraceabilityStage.ACABADO_BARNIZ,
          title: 'Lustrado a cera y acabado final',
          description: 'Aplicación de tres capas de cera virgen y herrajes metálicos forjados.',
          loggedBy: 'Control de Calidad San Roque',
        }),
      ]);

      // Product 2
      const prod2 = await this.productRepo.save(
        this.productRepo.create({
          title: 'Portafolio Ejecutivo en Cuero Genuino',
          description: 'Maletín/Portafolio confeccionado en cuero vacuno de 2.5mm con doble costura reforzada a mano, compartimentos para laptop y documentos.',
          price: 450.00,
          sku: 'SR-TALAB-POR-02',
          categoryId: catCuero?.id,
          workshopId: talab?.id,
          artisanId: artisans[1]?.id,
          imageUrls: [
            '/assets/images/portafolio.jpg',
          ],
          stock: 2,
          status: ProductStatus.AVAILABLE,
          isUniquePiece: false,
        }),
      );

      const batch2 = await this.batchRepo.save(
        this.batchRepo.create({
          productId: prod2.id,
          trackingCode: 'SR-TALAB-2026-002',
          stockQuantity: 2,
          batchStatus: 'LISTO_CATALOGO',
        }),
      );

      await this.eventRepo.save([
        this.eventRepo.create({
          batchId: batch2.id,
          stage: TraceabilityStage.MATERIA_PRIMA,
          title: 'Curtido y Corte de Cuero',
          description: 'Cuero vacuno curtido al vegetal libre de químicos tóxicos, corte preciso de moldes.',
          loggedBy: 'Taller de Marroquinería',
        }),
        this.eventRepo.create({
          batchId: batch2.id,
          stage: TraceabilityStage.ENSAMBLE_TALLADO,
          title: 'Costura Manual Repujada',
          description: 'Costura a dos agujas con hilo encerado de alta resistencia.',
          loggedBy: 'Taller de Marroquinería',
        }),
      ]);

      // Product 3
      const prod3 = await this.productRepo.save(
        this.productRepo.create({
          title: 'Poncho de Alpaca con Motivos Tarabuco',
          description: 'Poncho elaborado en telar tradicional con hilo de alpaca fina teñida con tintes naturales. Cálido, ligero e impermeable.',
          price: 520.00,
          sku: 'SR-TEJ-PON-03',
          categoryId: catTextil?.id,
          workshopId: tej?.id,
          artisanId: artisans[2]?.id,
          imageUrls: [
            'https://images.unsplash.com/photo-1606760227091-3dd858d9721b?auto=format&fit=crop&w=800&q=80',
          ],
          stock: 1,
          status: ProductStatus.AVAILABLE,
          isUniquePiece: true,
        }),
      );

      const batch3 = await this.batchRepo.save(
        this.batchRepo.create({
          productId: prod3.id,
          trackingCode: 'SR-TEJ-2026-003',
          stockQuantity: 1,
          batchStatus: 'LISTO_CATALOGO',
        }),
      );

      await this.eventRepo.save([
        this.eventRepo.create({
          batchId: batch3.id,
          stage: TraceabilityStage.MATERIA_PRIMA,
          title: 'Hilado de Alpaca Fina',
          description: 'Fibra seleccionada de alpaca hilada artesanalmente en rueca.',
          loggedBy: 'Taller Textil San Roque',
        }),
        this.eventRepo.create({
          batchId: batch3.id,
          stage: TraceabilityStage.LISTO_CATALOGO,
          title: 'Tejido final y flecado',
          description: 'Finalización de urdimbre y entramado con diseño ceremonial Tarabuco.',
          loggedBy: 'Taller Textil San Roque',
        }),
      ]);
    }
  }

  // Piezas con fotografías reales. Se insertan por SKU para que también
  // lleguen a bases de datos que ya tenían el catálogo inicial.
  private async seedCatalogAdditions() {
    const carp = await this.workshopRepo.findOne({ where: { code: 'CARP' } });
    const talab = await this.workshopRepo.findOne({ where: { code: 'TALAB' } });
    const catMadera = await this.categoryRepo.findOne({ where: { slug: 'madera-tallado' } });
    const catCuero = await this.categoryRepo.findOne({ where: { slug: 'cuero-marroquineria' } });
    const carpArtisan = carp ? await this.artisanRepo.findOne({ where: { workshopId: carp.id } }) : null;
    const talabArtisan = talab ? await this.artisanRepo.findOne({ where: { workshopId: talab.id } }) : null;

    const additions = [
      {
        product: {
          title: 'Barco Transatlántico a Escala en Madera',
          description: 'Réplica de un transatlántico construida pieza por pieza en madera natural: cubiertas, chimeneas, botes salvavidas y barandas armadas a mano. Una obra de exhibición única del taller de carpintería.',
          price: 650.0,
          sku: 'SR-CARP-BAR-04',
          categoryId: catMadera?.id,
          workshopId: carp?.id,
          artisanId: carpArtisan?.id,
          imageUrls: ['/assets/images/barco.jpg'],
          stock: 1,
          isUniquePiece: true,
        },
        trackingCode: 'SR-CARP-2026-004',
        loggedBy: 'Taller de Carpintería San Roque',
        events: [
          { stage: TraceabilityStage.MATERIA_PRIMA, title: 'Selección y corte de la madera', description: 'Preparación de listones y láminas de madera para el casco y las cubiertas.' },
          { stage: TraceabilityStage.ENSAMBLE_TALLADO, title: 'Armado del casco y las cubiertas', description: 'Ensamble a mano de cubiertas, chimeneas, botes salvavidas y barandas.' },
          { stage: TraceabilityStage.LISTO_CATALOGO, title: 'Acabado y exhibición', description: 'Lijado final y barniz natural. Pieza lista para su venta.' },
        ],
      },
      {
        product: {
          title: 'Camiones y Bus de Juguete en Madera',
          description: 'Vehículos de juguete tallados en madera y pintados a mano: camiones de carga con barandas y buses de pasajeros. Resistentes, ideales para regalo o colección.',
          price: 120.0,
          sku: 'SR-CARP-CAM-05',
          categoryId: catMadera?.id,
          workshopId: carp?.id,
          artisanId: carpArtisan?.id,
          imageUrls: ['/assets/images/camiones.jpg'],
          stock: 6,
          isUniquePiece: false,
        },
        trackingCode: 'SR-CARP-2026-005',
        loggedBy: 'Taller de Carpintería San Roque',
        events: [
          { stage: TraceabilityStage.ENSAMBLE_TALLADO, title: 'Corte y ensamble de piezas', description: 'Cabina, carrocería y ruedas cortadas y ensambladas en el taller.' },
          { stage: TraceabilityStage.ACABADO_BARNIZ, title: 'Pintado a mano', description: 'Pintura y detalles decorativos aplicados a mano en cada vehículo.' },
        ],
      },
      {
        product: {
          title: 'Sandalias de Cuero Artesanales',
          description: 'Sandalias y chancletas de cuero genuino cosidas a mano, disponibles en varios modelos, tallas y tonos naturales.',
          price: 90.0,
          sku: 'SR-TALAB-SAN-06',
          categoryId: catCuero?.id,
          workshopId: talab?.id,
          artisanId: talabArtisan?.id,
          imageUrls: ['/assets/images/chancletas.jpg'],
          stock: 12,
          isUniquePiece: false,
        },
        trackingCode: 'SR-TALAB-2026-006',
        loggedBy: 'Taller de Talabartería San Roque',
        events: [
          { stage: TraceabilityStage.DISENO_CORTE, title: 'Corte de tiras y plantillas', description: 'Corte del cuero para plantillas, suelas y tiras según cada modelo y talla.' },
          { stage: TraceabilityStage.ENSAMBLE_TALLADO, title: 'Costura y armado', description: 'Unión de tiras y suela con costura a mano.' },
        ],
      },
      {
        product: {
          title: 'Llavero de Cuero Repujado',
          description: 'Llavero de cuero con diseño floral repujado a mano y mosquetón metálico. Un recuerdo pequeño, resistente y hecho para durar.',
          price: 35.0,
          sku: 'SR-TALAB-LLA-07',
          categoryId: catCuero?.id,
          workshopId: talab?.id,
          artisanId: talabArtisan?.id,
          imageUrls: ['/assets/images/llavero_cuero.jpg'],
          stock: 20,
          isUniquePiece: false,
        },
        trackingCode: 'SR-TALAB-2026-007',
        loggedBy: 'Taller de Talabartería San Roque',
        events: [
          { stage: TraceabilityStage.DISENO_CORTE, title: 'Corte del cuero', description: 'Corte de la tira de cuero y preparación para el repujado.' },
          { stage: TraceabilityStage.ENSAMBLE_TALLADO, title: 'Repujado floral a mano', description: 'Grabado del diseño floral y montaje del mosquetón metálico.' },
        ],
      },
      {
        product: {
          title: 'Casita Artesanal de Madera',
          description: 'Casita en miniatura construida en madera, con techo decorado en pirograbado, jardín, macetas y cerca de listones. Pieza decorativa única hecha a mano.',
          price: 280.0,
          sku: 'SR-CARP-CAS-08',
          categoryId: catMadera?.id,
          workshopId: carp?.id,
          artisanId: carpArtisan?.id,
          imageUrls: ['/assets/images/casita.jpg'],
          stock: 1,
          isUniquePiece: true,
        },
        trackingCode: 'SR-CARP-2026-008',
        loggedBy: 'Taller de Carpintería San Roque',
        events: [
          { stage: TraceabilityStage.ENSAMBLE_TALLADO, title: 'Armado de la estructura', description: 'Construcción de paredes, techo, cerca y jardín a partir de listones de madera.' },
          { stage: TraceabilityStage.ACABADO_BARNIZ, title: 'Pirograbado del techo', description: 'Decoración del techo con pirograbado a mano y acabado final.' },
        ],
      },
    ];

    for (const item of additions) {
      const exists = await this.productRepo.findOne({ where: { sku: item.product.sku } });
      if (exists) continue;

      const product = await this.productRepo.save(
        this.productRepo.create({ ...item.product, status: ProductStatus.AVAILABLE }),
      );
      const batch = await this.batchRepo.save(
        this.batchRepo.create({
          productId: product.id,
          trackingCode: item.trackingCode,
          stockQuantity: item.product.stock,
          batchStatus: item.events[item.events.length - 1].stage,
        }),
      );
      await this.eventRepo.save(
        item.events.map((ev) => this.eventRepo.create({ ...ev, batchId: batch.id, loggedBy: item.loggedBy })),
      );
      console.log(`Seeded catalog product: ${product.title}`);
    }
  }

  // Reemplaza las fotos de prueba que no correspondían a los productos
  // iniciales. Solo actúa si el producto aún tiene la URL de prueba,
  // para no pisar fotos cargadas desde el panel.
  private async fixPlaceholderProductImages() {
    const fixes = [
      { sku: 'SR-CARP-COF-01', placeholder: 'photo-1546484475', imageUrl: '/assets/images/baul.jpg' },
      { sku: 'SR-TALAB-POR-02', placeholder: 'photo-1548036328', imageUrl: '/assets/images/portafolio.jpg' },
    ];

    for (const fix of fixes) {
      const product = await this.productRepo.findOne({ where: { sku: fix.sku } });
      if (product && product.imageUrls?.[0]?.includes(fix.placeholder)) {
        product.imageUrls = [fix.imageUrl];
        await this.productRepo.save(product);
        console.log(`Updated image for product: ${product.title}`);
      }
    }
  }

  // Igual que con los productos: solo reemplaza la foto de prueba original.
  private async fixPlaceholderCategoryImages() {
    const fixes = [
      { slug: 'madera-tallado', placeholder: 'photo-1546484475', imageUrl: '/assets/images/barco.jpg' },
      { slug: 'cuero-marroquineria', placeholder: 'photo-1548036328', imageUrl: '/assets/images/portafolio.jpg' },
    ];

    for (const fix of fixes) {
      const category = await this.categoryRepo.findOne({ where: { slug: fix.slug } });
      if (category && category.imageUrl?.includes(fix.placeholder)) {
        category.imageUrl = fix.imageUrl;
        await this.categoryRepo.save(category);
        console.log(`Updated image for category: ${category.name}`);
      }
    }
  }

  // San Roque es un recinto de varones: corrige el artesano textil
  // creado originalmente como "Maestra Elena".
  private async fixTextileArtisan() {
    const artisan = await this.artisanRepo.findOne({ where: { aliasCode: 'Maestra Elena - Taller Textil' } });
    if (artisan) {
      artisan.aliasCode = 'Maestro Elías - Taller Textil';
      artisan.bioImpactStory = artisan.bioImpactStory?.replace('Experta', 'Experto');
      await this.artisanRepo.save(artisan);
      console.log('Updated textile artisan: Maestro Elías');
    }
  }
}
