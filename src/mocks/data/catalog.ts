/**
 * catalog.ts — datos reales del catalogo Oja Yoruba
 *
 * ARCHIVO GENERADO — no editar manualmente.
 * Regenerar con: node scripts/transform-catalog.mjs <ruta-al-json>
 *
 * Fuente: /tmp/oja_data/oja/productos/_catalogo_completo.json
 * Generado: 2026-05-27T16:48:45.007Z
 * Productos: 256
 * Categorias: 14
 *
 * Decisiones de transformacion:
 *   price_with_tax = precio_actual (IVA incluido, lo que ve el cliente)
 *   base_price     = round(precio_actual / 1.16, 2)
 *   stock          = stock_disponible ?? 10 (todos son null en el catalogo)
 *   images         = solo la primera imagen (MVP; 37 productos tienen multiples)
 *   category       = categoria_principal (categoria primaria, 8 valores)
 *   all_categories = slugs de todas las categorias del producto (14 valores)
 */

export const CATALOG_CATEGORIES = [
  {
    "id": 1,
    "slug": "lo-nuevo",
    "name": "Lo Nuevo",
    "product_count": 82
  },
  {
    "id": 2,
    "slug": "akoses-medicinas",
    "name": "Akoses / Medicinas",
    "product_count": 74
  },
  {
    "id": 3,
    "slug": "collares-y-pulseras",
    "name": "Collares y Pulseras",
    "product_count": 69
  },
  {
    "id": 4,
    "slug": "isan-iconos",
    "name": "Isan / Iconos",
    "product_count": 67
  },
  {
    "id": 5,
    "slug": "complementos-y-herramientas",
    "name": "Complementos y Herramientas",
    "product_count": 45
  },
  {
    "id": 6,
    "slug": "enseres",
    "name": "Enseres",
    "product_count": 29
  },
  {
    "id": 7,
    "slug": "collares-de-orumila",
    "name": "Collares de Orumila",
    "product_count": 18
  },
  {
    "id": 8,
    "slug": "ikoberes-amuletos",
    "name": "Ikoberes / Amuletos",
    "product_count": 14
  },
  {
    "id": 9,
    "slug": "semillas",
    "name": "Semillas",
    "product_count": 10
  },
  {
    "id": 10,
    "slug": "ropa-y-telas",
    "name": "Ropa y Telas",
    "product_count": 8
  },
  {
    "id": 11,
    "slug": "varios",
    "name": "Varios",
    "product_count": 7
  },
  {
    "id": 12,
    "slug": "paquetes",
    "name": "Paquetes",
    "product_count": 5
  },
  {
    "id": 13,
    "slug": "mayoreo",
    "name": "Mayoreo",
    "product_count": 3
  },
  {
    "id": 14,
    "slug": "titulos",
    "name": "Titulos",
    "product_count": 3
  }
];

export const CATALOG_PRODUCTS = [
  {
    "id": 1,
    "slug": "abe-esu-cuchilla-de-esu",
    "sku": "OJA-ABEESUCU",
    "name": "Abe Esu / Cuchilla de Esu",
    "description": "♦ 12 cm de largo | • Navaja Africana de Esu",
    "base_price": 171.55,
    "price_with_tax": 199,
    "effective_price": 199,
    "stock": 10,
    "category_name": "Complementos y Herramientas",
    "category": {
      "id": 5,
      "name": "Complementos y Herramientas",
      "slug": "complementos-y-herramientas",
      "product_count": 45
    },
    "is_featured": false,
    "rating_avg": 5,
    "review_count": 4,
    "price": 199,
    "original_price": 250,
    "discount_pct": 20.4,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/abe-esu-cuchilla-de-esu.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/abe-esu-cuchilla-de-esu.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-ABEESUCU-01",
        "stock": 10,
        "price": 199
      }
    ],
    "all_categories": [
      "complementos-y-herramientas",
      "isan-iconos"
    ]
  },
  {
    "id": 2,
    "slug": "aceite-de-palma",
    "sku": "OJA-ACEITEDE",
    "name": "Aceite de Palma / Epò Pupa",
    "description": "♦ Aceite de palma de 1, 4 y 10 Litros. | ⇒ Siempre liquida aun en temperatura fría. | • En la religión Yoruba, el aceite de palma juega un papel significativo en diversas ceremonias y rituales. • Es considerado como un elemento sagrado y esencial en muchas prácticas religiosas yorubas. | • Tamaños Disponibles ⇓⇓⇓",
    "base_price": 171.55,
    "price_with_tax": 199,
    "effective_price": 199,
    "stock": 10,
    "category_name": "Enseres",
    "category": {
      "id": 6,
      "name": "Enseres",
      "slug": "enseres",
      "product_count": 29
    },
    "is_featured": false,
    "rating_avg": 4.97,
    "review_count": 75,
    "price": 199,
    "original_price": null,
    "discount_pct": null,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/aceite-de-palma-epò-pupa.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/aceite-de-palma-epò-pupa.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-ACEITEDE-01",
        "stock": 10,
        "price": 199
      }
    ],
    "all_categories": [
      "enseres"
    ]
  },
  {
    "id": 3,
    "slug": "ada-orisa",
    "sku": "OJA-ADAORISA",
    "name": "Ada Orisa",
    "description": "♦ Ada Orisa. | ⇒ Pieza forjada de 30 Cm. de largo Aprox. | • Ada Orisa” es una pieza de metal de gran importancia en los ceremoniales de la religión Yoruba. • Utilizado en diversas prácticas rituales, este objeto desempeña un papel esencial en las tradiciones y creencias de la comunidad Yoruba, que encuentra en él un símbolo de conexión con sus deidades y antepasados.",
    "base_price": 1378.45,
    "price_with_tax": 1599,
    "effective_price": 1599,
    "stock": 10,
    "category_name": "Complementos y Herramientas",
    "category": {
      "id": 5,
      "name": "Complementos y Herramientas",
      "slug": "complementos-y-herramientas",
      "product_count": 45
    },
    "is_featured": false,
    "rating_avg": 0,
    "review_count": 0,
    "price": 1599,
    "original_price": 1900,
    "discount_pct": 15.8,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/ada-orisa.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/ada-orisa.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-ADAORISA-01",
        "stock": 10,
        "price": 1599
      }
    ],
    "all_categories": [
      "complementos-y-herramientas",
      "isan-iconos"
    ]
  },
  {
    "id": 4,
    "slug": "adin-aceite-negro-1-litro",
    "sku": "OJA-ADINACEI",
    "name": "Adin / Aceite Negro 1 Litro",
    "description": "♦ Aceite de Palma Negro, 100% Puro. | • Presentación de 1 Litro.",
    "base_price": 1464.66,
    "price_with_tax": 1699,
    "effective_price": 1699,
    "stock": 10,
    "category_name": "Enseres",
    "category": {
      "id": 6,
      "name": "Enseres",
      "slug": "enseres",
      "product_count": 29
    },
    "is_featured": false,
    "rating_avg": 5,
    "review_count": 0,
    "price": 1699,
    "original_price": 2400,
    "discount_pct": 29.2,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/adin-aceite-negro-1-litro.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/adin-aceite-negro-1-litro.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-ADINACEI-01",
        "stock": 10,
        "price": 1699
      }
    ],
    "all_categories": [
      "enseres",
      "lo-nuevo"
    ]
  },
  {
    "id": 5,
    "slug": "adin-aceite-negro",
    "sku": "OJA-ADINACEI",
    "name": "Adin / Aceite Negro 500 ml",
    "description": "♦ Aceite de Palma Negro, 100% Puro. | • Presentación de 500 ml.",
    "base_price": 861.21,
    "price_with_tax": 999,
    "effective_price": 999,
    "stock": 10,
    "category_name": "Enseres",
    "category": {
      "id": 6,
      "name": "Enseres",
      "slug": "enseres",
      "product_count": 29
    },
    "is_featured": false,
    "rating_avg": 0,
    "review_count": 0,
    "price": 999,
    "original_price": 1200,
    "discount_pct": 16.8,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/adin-aceite-negro-500-ml.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/adin-aceite-negro-500-ml.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-ADINACEI-01",
        "stock": 10,
        "price": 999
      }
    ],
    "all_categories": [
      "enseres",
      "lo-nuevo"
    ]
  },
  {
    "id": 6,
    "slug": "agboran-de-ibeyis",
    "sku": "OJA-AGBORAND",
    "name": "Agboran de Ibeyis",
    "description": "♦ Medidas: Mod – 01 → 30 Cm de altura Mod – 02 → 35 Cm de altura | • En la religión Yoruba los agboran de Ibeyis son muñecos esculpidos en madera. • Estos muñecos suelen estar decorados con cuentas y otros accesorios. • Son objetos sagrados utilizados en rituales y ceremonias para honrar a las deidades gemelas.",
    "base_price": 2585.34,
    "price_with_tax": 2999,
    "effective_price": 2999,
    "stock": 10,
    "category_name": "Isan / Iconos",
    "category": {
      "id": 4,
      "name": "Isan / Iconos",
      "slug": "isan-iconos",
      "product_count": 67
    },
    "is_featured": false,
    "rating_avg": 5,
    "review_count": 2,
    "price": 2999,
    "original_price": null,
    "discount_pct": null,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/agboran-de-ibeyis.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/agboran-de-ibeyis.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-AGBORAND-01",
        "stock": 10,
        "price": 2999
      }
    ],
    "all_categories": [
      "isan-iconos"
    ]
  },
  {
    "id": 7,
    "slug": "agboran-de-obatala",
    "sku": "OJA-AGBORAND",
    "name": "Agboran de Obatala",
    "description": "♦ Medidas: Mod – 01 → 35 Cm de altura Mod – 02 → 39 Cm de altura | • En la religión Yoruba los agboran son muñecos esculpidos en madera. • Son objetos sagrados utilizados en rituales y ceremonias para representar y honrar a las deidades.",
    "base_price": 2154.31,
    "price_with_tax": 2499,
    "effective_price": 2499,
    "stock": 10,
    "category_name": "Isan / Iconos",
    "category": {
      "id": 4,
      "name": "Isan / Iconos",
      "slug": "isan-iconos",
      "product_count": 67
    },
    "is_featured": false,
    "rating_avg": 5,
    "review_count": 2,
    "price": 2499,
    "original_price": null,
    "discount_pct": null,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/agboran-de-obatala.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/agboran-de-obatala.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-AGBORAND-01",
        "stock": 10,
        "price": 2499
      }
    ],
    "all_categories": [
      "isan-iconos"
    ]
  },
  {
    "id": 8,
    "slug": "agboran-de-osun",
    "sku": "OJA-AGBORAND",
    "name": "Agboran de Osun",
    "description": "♦ Medidas: Mod – 01 → 35 Cm de altura Mod – 02 → 38 Cm de altura | • En la religión Yoruba los agboran son muñecos esculpidos en madera. • Son objetos sagrados utilizados en rituales y ceremonias para representar y honrar a las deidades.",
    "base_price": 2154.31,
    "price_with_tax": 2499,
    "effective_price": 2499,
    "stock": 10,
    "category_name": "Isan / Iconos",
    "category": {
      "id": 4,
      "name": "Isan / Iconos",
      "slug": "isan-iconos",
      "product_count": 67
    },
    "is_featured": false,
    "rating_avg": 5,
    "review_count": 2,
    "price": 2499,
    "original_price": null,
    "discount_pct": null,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/agboran-de-osun.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/agboran-de-osun.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-AGBORAND-01",
        "stock": 10,
        "price": 2499
      }
    ],
    "all_categories": [
      "isan-iconos"
    ]
  },
  {
    "id": 9,
    "slug": "agboran-de-oya",
    "sku": "OJA-AGBORAND",
    "name": "Agboran de Oya",
    "description": "♦ Medidas: Mod – 01 → 35 Cm de altura Mod – 02 → 43 Cm de altura | • En la religión Yoruba los agboran son muñecos esculpidos en madera. • Son objetos sagrados utilizados en rituales y ceremonias para representar y honrar a las deidades.",
    "base_price": 2154.31,
    "price_with_tax": 2499,
    "effective_price": 2499,
    "stock": 10,
    "category_name": "Isan / Iconos",
    "category": {
      "id": 4,
      "name": "Isan / Iconos",
      "slug": "isan-iconos",
      "product_count": 67
    },
    "is_featured": false,
    "rating_avg": 5,
    "review_count": 0,
    "price": 2499,
    "original_price": null,
    "discount_pct": null,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/agboran-de-oya.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/agboran-de-oya.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-AGBORAND-01",
        "stock": 10,
        "price": 2499
      }
    ],
    "all_categories": [
      "isan-iconos"
    ]
  },
  {
    "id": 10,
    "slug": "agboran-de-sango",
    "sku": "OJA-AGBORAND",
    "name": "Agboran de Sango",
    "description": "♦ Medidas: Mod – 01 → 36 Cm de altura Mod – 02 → 43 Cm de altura | • En la religión Yoruba los agboran son muñecos esculpidos en madera. • Son objetos sagrados utilizados en rituales y ceremonias para representar y honrar a las deidades.",
    "base_price": 2154.31,
    "price_with_tax": 2499,
    "effective_price": 2499,
    "stock": 10,
    "category_name": "Isan / Iconos",
    "category": {
      "id": 4,
      "name": "Isan / Iconos",
      "slug": "isan-iconos",
      "product_count": 67
    },
    "is_featured": false,
    "rating_avg": 5,
    "review_count": 5,
    "price": 2499,
    "original_price": null,
    "discount_pct": null,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/agboran-de-sango.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/agboran-de-sango.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-AGBORAND-01",
        "stock": 10,
        "price": 2499
      }
    ],
    "all_categories": [
      "isan-iconos"
    ]
  },
  {
    "id": 11,
    "slug": "agboran-de-yemoja",
    "sku": "OJA-AGBORAND",
    "name": "Agboran de Yemoja",
    "description": "♦ Medidas: Mod – 01 → 35 Cm de altura Mod – 02 → 43 Cm de altura | • En la religión Yoruba los agboran son muñecos esculpidos en madera. • Son objetos sagrados utilizados en rituales y ceremonias para representar y honrar a las deidades.",
    "base_price": 2154.31,
    "price_with_tax": 2499,
    "effective_price": 2499,
    "stock": 10,
    "category_name": "Isan / Iconos",
    "category": {
      "id": 4,
      "name": "Isan / Iconos",
      "slug": "isan-iconos",
      "product_count": 67
    },
    "is_featured": false,
    "rating_avg": 0,
    "review_count": 0,
    "price": 2499,
    "original_price": null,
    "discount_pct": null,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/agboran-de-yemoja.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/agboran-de-yemoja.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-AGBORAND-01",
        "stock": 10,
        "price": 2499
      }
    ],
    "all_categories": [
      "isan-iconos"
    ]
  },
  {
    "id": 12,
    "slug": "agboran-ogun",
    "sku": "OJA-AGBORANO",
    "name": "Agboran Ogun",
    "description": "♦ Medidas: → 35 Cm de altura | ⇒ Representación de Ogun | • En la religión Yoruba los agboran son muñecos esculpidos en madera. • Son objetos sagrados utilizados en rituales y ceremonias para representar y honrar a las deidades.",
    "base_price": 2154.31,
    "price_with_tax": 2499,
    "effective_price": 2499,
    "stock": 10,
    "category_name": "Isan / Iconos",
    "category": {
      "id": 4,
      "name": "Isan / Iconos",
      "slug": "isan-iconos",
      "product_count": 67
    },
    "is_featured": false,
    "rating_avg": 5,
    "review_count": 4,
    "price": 2499,
    "original_price": null,
    "discount_pct": null,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/agboran-ogun.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/agboran-ogun.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-AGBORANO-01",
        "stock": 10,
        "price": 2499
      }
    ],
    "all_categories": [
      "isan-iconos"
    ]
  },
  {
    "id": 13,
    "slug": "osoosi",
    "sku": "OJA-OSOOSI",
    "name": "Agboran Osoosi",
    "description": "♦ Agboran de Osoosi, Gran Detalle | → Agboran de 35 cm de Altura",
    "base_price": 2412.93,
    "price_with_tax": 2799,
    "effective_price": 2799,
    "stock": 10,
    "category_name": "Isan / Iconos",
    "category": {
      "id": 4,
      "name": "Isan / Iconos",
      "slug": "isan-iconos",
      "product_count": 67
    },
    "is_featured": false,
    "rating_avg": 0,
    "review_count": 0,
    "price": 2799,
    "original_price": null,
    "discount_pct": null,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/agboran-osoosi.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/agboran-osoosi.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-OSOOSI-01",
        "stock": 10,
        "price": 2799
      }
    ],
    "all_categories": [
      "isan-iconos"
    ]
  },
  {
    "id": 14,
    "slug": "agogo-ifa-africana",
    "sku": "OJA-AGOGOIFA",
    "name": "Agogo Ifa Africana",
    "description": "♦ Elaborado en metal forjado de alta resonancia, este instrumento es esencial para invocar la presencia de Orunmila y Orisas, marcar el ritmo en los rezos y cantos. • Una pieza auténtica que combina arte, tradición y espiritualidad.",
    "base_price": 1206.03,
    "price_with_tax": 1399,
    "effective_price": 1399,
    "stock": 10,
    "category_name": "Complementos y Herramientas",
    "category": {
      "id": 5,
      "name": "Complementos y Herramientas",
      "slug": "complementos-y-herramientas",
      "product_count": 45
    },
    "is_featured": false,
    "rating_avg": 0,
    "review_count": 0,
    "price": 1399,
    "original_price": null,
    "discount_pct": null,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/agogo-ifa-africana.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/agogo-ifa-africana.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-AGOGOIFA-01",
        "stock": 10,
        "price": 1399
      }
    ],
    "all_categories": [
      "complementos-y-herramientas",
      "lo-nuevo"
    ]
  },
  {
    "id": 15,
    "slug": "aidan-vaina",
    "sku": "OJA-AIDANVAI",
    "name": "Aidan Vaina",
    "description": "♦ 20 Cm largo Aproximado",
    "base_price": 257.76,
    "price_with_tax": 299,
    "effective_price": 299,
    "stock": 10,
    "category_name": "Enseres",
    "category": {
      "id": 6,
      "name": "Enseres",
      "slug": "enseres",
      "product_count": 29
    },
    "is_featured": false,
    "rating_avg": 5,
    "review_count": 0,
    "price": 299,
    "original_price": null,
    "discount_pct": null,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/aidan-vaina.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/aidan-vaina.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-AIDANVAI-01",
        "stock": 10,
        "price": 299
      }
    ],
    "all_categories": [
      "enseres",
      "lo-nuevo"
    ]
  },
  {
    "id": 16,
    "slug": "aipe-owo-abanico-de-mano",
    "sku": "OJA-AIPEOWOA",
    "name": "Aìpẹ Owọ / Abanico de mano",
    "description": "♦ Medidas: • 28 cm alto cerrado • 40 cm alto abierto",
    "base_price": 1033.62,
    "price_with_tax": 1199,
    "effective_price": 1199,
    "stock": 10,
    "category_name": "Akoses / Medicinas",
    "category": {
      "id": 2,
      "name": "Akoses / Medicinas",
      "slug": "akoses-medicinas",
      "product_count": 74
    },
    "is_featured": false,
    "rating_avg": 0,
    "review_count": 0,
    "price": 1199,
    "original_price": 2000,
    "discount_pct": 40,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/aìpẹ-owọ-abanico-de-mano.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/aìpẹ-owọ-abanico-de-mano.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-AIPEOWOA-01",
        "stock": 10,
        "price": 1199
      }
    ],
    "all_categories": [
      "akoses-medicinas",
      "lo-nuevo",
      "varios"
    ]
  },
  {
    "id": 17,
    "slug": "aja-ogun-doble-chica",
    "sku": "OJA-AJAOGUND",
    "name": "Aja Ogun Doble Chica",
    "description": "Àjà Ògún Campana Doble Chica, Costo por Pieza | 18 Cm de Largo",
    "base_price": 645.69,
    "price_with_tax": 749,
    "effective_price": 749,
    "stock": 10,
    "category_name": "Complementos y Herramientas",
    "category": {
      "id": 5,
      "name": "Complementos y Herramientas",
      "slug": "complementos-y-herramientas",
      "product_count": 45
    },
    "is_featured": false,
    "rating_avg": 5,
    "review_count": 0,
    "price": 749,
    "original_price": null,
    "discount_pct": null,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/aja-ogun-doble-chica.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/aja-ogun-doble-chica.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-AJAOGUND-01",
        "stock": 10,
        "price": 749
      }
    ],
    "all_categories": [
      "complementos-y-herramientas"
    ]
  },
  {
    "id": 18,
    "slug": "aja-ogun-doble-grande",
    "sku": "OJA-AJAOGUND",
    "name": "Aja Ogun Doble Grande",
    "description": "Àjà Ògún Campana Doble | 30 Cm de Largo",
    "base_price": 818.1,
    "price_with_tax": 949,
    "effective_price": 949,
    "stock": 10,
    "category_name": "Complementos y Herramientas",
    "category": {
      "id": 5,
      "name": "Complementos y Herramientas",
      "slug": "complementos-y-herramientas",
      "product_count": 45
    },
    "is_featured": false,
    "rating_avg": 0,
    "review_count": 0,
    "price": 949,
    "original_price": null,
    "discount_pct": null,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/aja-ogun-doble-grande.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/aja-ogun-doble-grande.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-AJAOGUND-01",
        "stock": 10,
        "price": 949
      }
    ],
    "all_categories": [
      "complementos-y-herramientas"
    ]
  },
  {
    "id": 19,
    "slug": "aja-ogun-sencillo",
    "sku": "OJA-AJAOGUNS",
    "name": "Aja Ogun Sencillo",
    "description": "Àjà Ògún Campana Sencilla | 27 Cm de Largo",
    "base_price": 775,
    "price_with_tax": 899,
    "effective_price": 899,
    "stock": 10,
    "category_name": "Complementos y Herramientas",
    "category": {
      "id": 5,
      "name": "Complementos y Herramientas",
      "slug": "complementos-y-herramientas",
      "product_count": 45
    },
    "is_featured": false,
    "rating_avg": 5,
    "review_count": 0,
    "price": 899,
    "original_price": null,
    "discount_pct": null,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/aja-ogun-sencillo.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/aja-ogun-sencillo.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-AJAOGUNS-01",
        "stock": 10,
        "price": 899
      }
    ],
    "all_categories": [
      "complementos-y-herramientas"
    ]
  },
  {
    "id": 20,
    "slug": "ajere-larga-01",
    "sku": "OJA-AJERELAR",
    "name": "Ajere Alta Mod.01 / Pieza UNICA",
    "description": "♦ Medidas: Altura → 65 Cm Diámetro → 28 Cm | • En la religión Yoruba los Ajere son esculpidos en madera. • Son objetos sagrados utilizados en rituales y ceremonias para funcionar como recipiente para los Ikines de Ifa.",
    "base_price": 12930.17,
    "price_with_tax": 14999,
    "effective_price": 14999,
    "stock": 10,
    "category_name": "Isan / Iconos",
    "category": {
      "id": 4,
      "name": "Isan / Iconos",
      "slug": "isan-iconos",
      "product_count": 67
    },
    "is_featured": false,
    "rating_avg": 0,
    "review_count": 0,
    "price": 14999,
    "original_price": 20000,
    "discount_pct": 25,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/ajere-alta-mod-01-pieza-unica.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/ajere-alta-mod-01-pieza-unica.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-AJERELAR-01",
        "stock": 10,
        "price": 14999
      }
    ],
    "all_categories": [
      "isan-iconos"
    ]
  },
  {
    "id": 21,
    "slug": "ajere-larga-03",
    "sku": "OJA-AJERELAR",
    "name": "Ajere Alta Mod.03 / Pieza UNICA",
    "description": "♦ Medidas: Altura → 65 Cm Diámetro → 28 Cm | • En la religión Yoruba los Ajere son esculpidos en madera. • Son objetos sagrados utilizados en rituales y ceremonias para funcionar como recipiente para los Ikines de Ifa.",
    "base_price": 11206.03,
    "price_with_tax": 12999,
    "effective_price": 12999,
    "stock": 10,
    "category_name": "Isan / Iconos",
    "category": {
      "id": 4,
      "name": "Isan / Iconos",
      "slug": "isan-iconos",
      "product_count": 67
    },
    "is_featured": false,
    "rating_avg": 0,
    "review_count": 0,
    "price": 12999,
    "original_price": 18000,
    "discount_pct": 27.8,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/ajere-alta-mod-03-pieza-unica.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/ajere-alta-mod-03-pieza-unica.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-AJERELAR-01",
        "stock": 10,
        "price": 12999
      }
    ],
    "all_categories": [
      "isan-iconos"
    ]
  },
  {
    "id": 22,
    "slug": "ajere-ifa-chica",
    "sku": "OJA-AJEREIFA",
    "name": "Ajere Chica / Isefa o Ifa",
    "description": "♦ Ajere Ifa • Compartimiento arriba y compartimiento pequeño al centro | ♦ Medidas: Altura → 29 Cm Diametro Recipiente superior → 13 Cm",
    "base_price": 2542.24,
    "price_with_tax": 2949,
    "effective_price": 2949,
    "stock": 10,
    "category_name": "Isan / Iconos",
    "category": {
      "id": 4,
      "name": "Isan / Iconos",
      "slug": "isan-iconos",
      "product_count": 67
    },
    "is_featured": false,
    "rating_avg": 5,
    "review_count": 2,
    "price": 2949,
    "original_price": 3500,
    "discount_pct": 15.7,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/ajere-chica-isefa-o-ifa.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/ajere-chica-isefa-o-ifa.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-AJEREIFA-01",
        "stock": 10,
        "price": 2949
      }
    ],
    "all_categories": [
      "isan-iconos",
      "lo-nuevo"
    ]
  },
  {
    "id": 23,
    "slug": "ajere-ifa-0",
    "sku": "OJA-AJEREIFA",
    "name": "Ajere Ifa / Alto Relieve",
    "description": "♦ Ajere de Gran Detalle y Alto Relieve • Medidas: Altura → 40 Cm Diámetro → 26 Cm | • En la religión Yoruba los Ajere son esculpidos en madera. • Son objetos sagrados utilizados en rituales y ceremonias para funcionar como recipiente para los Ikines de Ifa.",
    "base_price": 9481.9,
    "price_with_tax": 10999,
    "effective_price": 10999,
    "stock": 10,
    "category_name": "Isan / Iconos",
    "category": {
      "id": 4,
      "name": "Isan / Iconos",
      "slug": "isan-iconos",
      "product_count": 67
    },
    "is_featured": false,
    "rating_avg": 0,
    "review_count": 0,
    "price": 10999,
    "original_price": 15000,
    "discount_pct": 26.7,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/ajere-ifa-alto-relieve.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/ajere-ifa-alto-relieve.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-AJEREIFA-01",
        "stock": 10,
        "price": 10999
      }
    ],
    "all_categories": [
      "isan-iconos",
      "lo-nuevo"
    ]
  },
  {
    "id": 24,
    "slug": "ajere-ifa",
    "sku": "OJA-AJEREIFA",
    "name": "Ajere Ifa Mediana",
    "description": "♦ Medidas: Mod – 01 → 25 Cm Altura, 24 Cm Diámetro Mod – 02 → 28 Cm Altura, 23 Cm Diámetro Mod – 03 → 22 Cm Altura, 24 Cm Diámetro Mod – 04 → 22 Cm Altura, 24 Cm Diámetro | • Modelos Disponibles ⇓⇓⇓",
    "base_price": 4050.86,
    "price_with_tax": 4699,
    "effective_price": 4699,
    "stock": 10,
    "category_name": "Isan / Iconos",
    "category": {
      "id": 4,
      "name": "Isan / Iconos",
      "slug": "isan-iconos",
      "product_count": 67
    },
    "is_featured": false,
    "rating_avg": 5,
    "review_count": 0,
    "price": 4699,
    "original_price": null,
    "discount_pct": null,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/ajere-ifa-mediana.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/ajere-ifa-mediana.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-AJEREIFA-01",
        "stock": 10,
        "price": 4699
      }
    ],
    "all_categories": [
      "isan-iconos"
    ]
  },
  {
    "id": 25,
    "slug": "ajetumobi",
    "sku": "OJA-AJETUMOB",
    "name": "Ajetumobi / para Generar Riqueza",
    "description": "Botella con medicina para Atraer la Riqueza. | Akose dentro de la Botella | USO: Se llena con ginebra y se va tomando un poco diario.",
    "base_price": 2155.17,
    "price_with_tax": 2500,
    "effective_price": 2500,
    "stock": 10,
    "category_name": "Akoses / Medicinas",
    "category": {
      "id": 2,
      "name": "Akoses / Medicinas",
      "slug": "akoses-medicinas",
      "product_count": 74
    },
    "is_featured": false,
    "rating_avg": 5,
    "review_count": 4,
    "price": 2500,
    "original_price": null,
    "discount_pct": null,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/ajetumobi-para-generar-riqueza.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/ajetumobi-para-generar-riqueza.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-AJETUMOB-01",
        "stock": 10,
        "price": 2500
      }
    ],
    "all_categories": [
      "akoses-medicinas"
    ]
  },
  {
    "id": 26,
    "slug": "akara",
    "sku": "OJA-AKARA",
    "name": "Akara / Frijol Molido",
    "description": "♦ Akara / Frijol en Polvo, presentación de 1/2 Libra (Ideal para Freír) | Nota: Si deseas 1 Libra favor de seleccionar 2 piezas y así sucesivamente",
    "base_price": 215.52,
    "price_with_tax": 250,
    "effective_price": 250,
    "stock": 10,
    "category_name": "Enseres",
    "category": {
      "id": 6,
      "name": "Enseres",
      "slug": "enseres",
      "product_count": 29
    },
    "is_featured": false,
    "rating_avg": 5,
    "review_count": 18,
    "price": 250,
    "original_price": 400,
    "discount_pct": 37.5,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/akara-frijol-molido.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/akara-frijol-molido.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-AKARA-01",
        "stock": 10,
        "price": 250
      }
    ],
    "all_categories": [
      "enseres"
    ]
  },
  {
    "id": 27,
    "slug": "ganar-casos-en-la-corte",
    "sku": "OJA-GANARCAS",
    "name": "Akose Adani Lare Ejo / GANAR CASOS EN LA CORTE",
    "description": "Medicina para Ganar Casos en la Corte. | Uso: Incisiones, 7 para Mujer y 9 para Hombre en la Cabeza.",
    "base_price": 603.45,
    "price_with_tax": 700,
    "effective_price": 700,
    "stock": 10,
    "category_name": "Akoses / Medicinas",
    "category": {
      "id": 2,
      "name": "Akoses / Medicinas",
      "slug": "akoses-medicinas",
      "product_count": 74
    },
    "is_featured": false,
    "rating_avg": 5,
    "review_count": 4,
    "price": 700,
    "original_price": null,
    "discount_pct": null,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/akose-adani-lare-ejo-ganar-casos-en-la-corte.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/akose-adani-lare-ejo-ganar-casos-en-la-corte.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-GANARCAS-01",
        "stock": 10,
        "price": 700
      }
    ],
    "all_categories": [
      "akoses-medicinas"
    ]
  },
  {
    "id": 28,
    "slug": "agadango-abrir-camino-a-los-negocios",
    "sku": "OJA-AGADANGO",
    "name": "Akose Agadango / ABRIR CAMINO A LOS NEGOCIOS",
    "description": "Medicina para Abrir Camino a los Negocios. | Uso: Incisiones, 7 para Mujer y 9 para Hombre en la Cabeza.",
    "base_price": 431.03,
    "price_with_tax": 500,
    "effective_price": 500,
    "stock": 10,
    "category_name": "Akoses / Medicinas",
    "category": {
      "id": 2,
      "name": "Akoses / Medicinas",
      "slug": "akoses-medicinas",
      "product_count": 74
    },
    "is_featured": false,
    "rating_avg": 5,
    "review_count": 9,
    "price": 500,
    "original_price": null,
    "discount_pct": null,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/akose-agadango-abrir-camino-a-los-negocios.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/akose-agadango-abrir-camino-a-los-negocios.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-AGADANGO-01",
        "stock": 10,
        "price": 500
      }
    ],
    "all_categories": [
      "akoses-medicinas"
    ]
  },
  {
    "id": 29,
    "slug": "akose-agbara-oko-potencia-sexual",
    "sku": "OJA-AKOSEAGB",
    "name": "Akose Agbara Oko / POTENCIA SEXUAL",
    "description": "♦ Akose para la potencia sexual masculina | • Frasco con 5 tomas. • 1 toma cada 3er día.",
    "base_price": 861.21,
    "price_with_tax": 999,
    "effective_price": 999,
    "stock": 10,
    "category_name": "Akoses / Medicinas",
    "category": {
      "id": 2,
      "name": "Akoses / Medicinas",
      "slug": "akoses-medicinas",
      "product_count": 74
    },
    "is_featured": false,
    "rating_avg": 5,
    "review_count": 0,
    "price": 999,
    "original_price": null,
    "discount_pct": null,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/akose-agbara-oko-potencia-sexual.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/akose-agbara-oko-potencia-sexual.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-AKOSEAGB-01",
        "stock": 10,
        "price": 999
      }
    ],
    "all_categories": [
      "akoses-medicinas",
      "lo-nuevo"
    ]
  },
  {
    "id": 30,
    "slug": "para-prosperidad",
    "sku": "OJA-PARAPROS",
    "name": "Akose Aisiki / PARA PROSPERIDAD",
    "description": "Medicina para Obtener Prosperidad. | Uso: Incisiones, 7 para Mujer y 9 para Hombre en la Cabeza.",
    "base_price": 431.03,
    "price_with_tax": 500,
    "effective_price": 500,
    "stock": 10,
    "category_name": "Akoses / Medicinas",
    "category": {
      "id": 2,
      "name": "Akoses / Medicinas",
      "slug": "akoses-medicinas",
      "product_count": 74
    },
    "is_featured": false,
    "rating_avg": 5,
    "review_count": 5,
    "price": 500,
    "original_price": null,
    "discount_pct": null,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/akose-aisiki-para-prosperidad.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/akose-aisiki-para-prosperidad.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-PARAPROS-01",
        "stock": 10,
        "price": 500
      }
    ],
    "all_categories": [
      "akoses-medicinas"
    ]
  },
  {
    "id": 31,
    "slug": "akose-alubarika",
    "sku": "OJA-AKOSEALU",
    "name": "Akose Alubarika / REGRESAR EL DAÑO",
    "description": "♦ Akose para regresar el daño de ataques energéticos. | • Rinde 2 dosis, verter la mitad del polvo en una botella con Oti y beber un poco diario.",
    "base_price": 861.21,
    "price_with_tax": 999,
    "effective_price": 999,
    "stock": 10,
    "category_name": "Akoses / Medicinas",
    "category": {
      "id": 2,
      "name": "Akoses / Medicinas",
      "slug": "akoses-medicinas",
      "product_count": 74
    },
    "is_featured": false,
    "rating_avg": 5,
    "review_count": 0,
    "price": 999,
    "original_price": null,
    "discount_pct": null,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/akose-alubarika-regresar-el-daño.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/akose-alubarika-regresar-el-daño.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-AKOSEALU-01",
        "stock": 10,
        "price": 999
      }
    ],
    "all_categories": [
      "akoses-medicinas",
      "lo-nuevo"
    ]
  },
  {
    "id": 32,
    "slug": "akose-arubi-prision",
    "sku": "OJA-AKOSEARU",
    "name": "Akose Arubi / PRISÍON",
    "description": "Medicina para evitar prisión y problemas legales | Aplicación: Incisiones en el empeine de los pies.",
    "base_price": 603.45,
    "price_with_tax": 700,
    "effective_price": 700,
    "stock": 10,
    "category_name": "Akoses / Medicinas",
    "category": {
      "id": 2,
      "name": "Akoses / Medicinas",
      "slug": "akoses-medicinas",
      "product_count": 74
    },
    "is_featured": false,
    "rating_avg": 5,
    "review_count": 5,
    "price": 700,
    "original_price": null,
    "discount_pct": null,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/akose-arubi-prisíon.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/akose-arubi-prisíon.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-AKOSEARU-01",
        "stock": 10,
        "price": 700
      }
    ],
    "all_categories": [
      "akoses-medicinas"
    ]
  },
  {
    "id": 33,
    "slug": "akose-arun-buburu-para-el-cancer",
    "sku": "OJA-AKOSEARU",
    "name": "Akose Arun Buburu / PARA EL CANCER",
    "description": "Medicina que ayuda la mejoría de personas enfermas y previene el cáncer. | Uso: Tomado, 16 Tomas representa a 1 Dosis, Frasco con cantidad para 20 Tomas | Nota: Precio Publicado equivale a 1 frasco",
    "base_price": 2155.17,
    "price_with_tax": 2500,
    "effective_price": 2500,
    "stock": 10,
    "category_name": "Akoses / Medicinas",
    "category": {
      "id": 2,
      "name": "Akoses / Medicinas",
      "slug": "akoses-medicinas",
      "product_count": 74
    },
    "is_featured": false,
    "rating_avg": 5,
    "review_count": 2,
    "price": 2500,
    "original_price": null,
    "discount_pct": null,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/akose-arun-buburu-para-el-cancer.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/akose-arun-buburu-para-el-cancer.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-AKOSEARU-01",
        "stock": 10,
        "price": 2500
      }
    ],
    "all_categories": [
      "akoses-medicinas"
    ]
  },
  {
    "id": 34,
    "slug": "akose-aseta-gallo",
    "sku": "OJA-AKOSEASE",
    "name": "Akose Aseta (gallo) / VENCER ENEMIGOS",
    "description": "♦ Medicina Aseta, para devolver el mal a los enemigos, manifiesta lo que desean en contra nuestra sobre los enemigos. | • Aplicación: se aplica en incisiones en la cabeza y se pone un gallo en la cabeza para demostrar el poder de la medicina.",
    "base_price": 1724.14,
    "price_with_tax": 2000,
    "effective_price": 2000,
    "stock": 10,
    "category_name": "Akoses / Medicinas",
    "category": {
      "id": 2,
      "name": "Akoses / Medicinas",
      "slug": "akoses-medicinas",
      "product_count": 74
    },
    "is_featured": false,
    "rating_avg": 5,
    "review_count": 3,
    "price": 2000,
    "original_price": null,
    "discount_pct": null,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/akose-aseta-gallo-vencer-enemigos.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/akose-aseta-gallo-vencer-enemigos.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-AKOSEASE-01",
        "stock": 10,
        "price": 2000
      }
    ],
    "all_categories": [
      "akoses-medicinas"
    ]
  },
  {
    "id": 35,
    "slug": "liberar-esclavitud",
    "sku": "OJA-LIBERARE",
    "name": "Akose Atherence / LIBERACION DE CUALQUIER ESCLAVITUD",
    "description": "Medicina para Liberar de Cualquier Esclavitud, sea amarre o ataduras o problemas emocionales. | Uso: Incisiones, 7 para Mujer y 9 para Hombre en la Cabeza.",
    "base_price": 603.45,
    "price_with_tax": 700,
    "effective_price": 700,
    "stock": 10,
    "category_name": "Akoses / Medicinas",
    "category": {
      "id": 2,
      "name": "Akoses / Medicinas",
      "slug": "akoses-medicinas",
      "product_count": 74
    },
    "is_featured": false,
    "rating_avg": 5,
    "review_count": 5,
    "price": 700,
    "original_price": null,
    "discount_pct": null,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/akose-atherence-liberacion-de-cualquier-esclavitud.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/akose-atherence-liberacion-de-cualquier-esclavitud.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-LIBERARE-01",
        "stock": 10,
        "price": 700
      }
    ],
    "all_categories": [
      "akoses-medicinas"
    ]
  },
  {
    "id": 36,
    "slug": "akose-atogbe-diabetes",
    "sku": "OJA-AKOSEATO",
    "name": "Akose Atogbe / DIABETES",
    "description": "♦ Medicina para la Diabetes | • Uso: Tomado, 16 Tomas representa a 1 Dosis, Frasco con cantidad para 20 Tomas | Nota: Precio Publicado equivale a 1 frasco",
    "base_price": 1293.1,
    "price_with_tax": 1500,
    "effective_price": 1500,
    "stock": 10,
    "category_name": "Akoses / Medicinas",
    "category": {
      "id": 2,
      "name": "Akoses / Medicinas",
      "slug": "akoses-medicinas",
      "product_count": 74
    },
    "is_featured": false,
    "rating_avg": 5,
    "review_count": 3,
    "price": 1500,
    "original_price": null,
    "discount_pct": null,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/akose-atogbe-diabetes.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/akose-atogbe-diabetes.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-AKOSEATO-01",
        "stock": 10,
        "price": 1500
      }
    ],
    "all_categories": [
      "akoses-medicinas"
    ]
  },
  {
    "id": 37,
    "slug": "resolver-problemas-legales",
    "sku": "OJA-RESOLVER",
    "name": "Akose Atude Ewon / RESOLVER PROBLEMAS LEGALES",
    "description": "Medicina para Resolver Problemas Legales. | Uso: Incisiones, 7 para Mujer y 9 para Hombre en la Cabeza.",
    "base_price": 603.45,
    "price_with_tax": 700,
    "effective_price": 700,
    "stock": 10,
    "category_name": "Akoses / Medicinas",
    "category": {
      "id": 2,
      "name": "Akoses / Medicinas",
      "slug": "akoses-medicinas",
      "product_count": 74
    },
    "is_featured": false,
    "rating_avg": 5,
    "review_count": 3,
    "price": 700,
    "original_price": null,
    "discount_pct": null,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/akose-atude-ewon-resolver-problemas-legales.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/akose-atude-ewon-resolver-problemas-legales.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-RESOLVER-01",
        "stock": 10,
        "price": 700
      }
    ],
    "all_categories": [
      "akoses-medicinas"
    ]
  },
  {
    "id": 38,
    "slug": "regular-menstruacion",
    "sku": "OJA-REGULARM",
    "name": "Akose Awari / REGULAR LA MENSTRUACION",
    "description": "Medicina para Regular la Menstruación y aliviar afectaciones derivado de el ciclo. | Uso: Tomado, 16 Tomas representa a 1 Dosis, Frasco con cantidad para 20 Tomas | Nota: Precio Publicado equivale a 1 frasco.",
    "base_price": 603.45,
    "price_with_tax": 700,
    "effective_price": 700,
    "stock": 10,
    "category_name": "Akoses / Medicinas",
    "category": {
      "id": 2,
      "name": "Akoses / Medicinas",
      "slug": "akoses-medicinas",
      "product_count": 74
    },
    "is_featured": false,
    "rating_avg": 5,
    "review_count": 2,
    "price": 700,
    "original_price": null,
    "discount_pct": null,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/akose-awari-regular-la-menstruacion.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/akose-awari-regular-la-menstruacion.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-REGULARM-01",
        "stock": 10,
        "price": 700
      }
    ],
    "all_categories": [
      "akoses-medicinas"
    ]
  },
  {
    "id": 39,
    "slug": "akose-awogba-arun-salud-en-general",
    "sku": "OJA-AKOSEAWO",
    "name": "Akose Awogba Arun / SALUD EN GENERAL",
    "description": "♦ Medicina para obtener la salud general del cuerpo y evitar enfermedades graves. | • Uso: Tomado, 16 Tomas representa a 1 Dosis, Frasco con cantidad para 20 Tomas | • Nota: Precio Publicado equivale a 1 frasco",
    "base_price": 862.07,
    "price_with_tax": 1000,
    "effective_price": 1000,
    "stock": 10,
    "category_name": "Akoses / Medicinas",
    "category": {
      "id": 2,
      "name": "Akoses / Medicinas",
      "slug": "akoses-medicinas",
      "product_count": 74
    },
    "is_featured": false,
    "rating_avg": 5,
    "review_count": 11,
    "price": 1000,
    "original_price": null,
    "discount_pct": null,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/akose-awogba-arun-salud-en-general.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/akose-awogba-arun-salud-en-general.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-AKOSEAWO-01",
        "stock": 10,
        "price": 1000
      }
    ],
    "all_categories": [
      "akoses-medicinas"
    ]
  },
  {
    "id": 40,
    "slug": "akose-buburu-ati-osi-evitar-pobreza-y-miseria",
    "sku": "OJA-AKOSEBUB",
    "name": "Akose Buburu ati Osi / EVITAR MISERIA Y PROBREZA",
    "description": "Medicina para evitar que uno caiga en miseria o pobreza. | Aplicación: Incisiones en las muñecas y tobillos",
    "base_price": 431.03,
    "price_with_tax": 500,
    "effective_price": 500,
    "stock": 10,
    "category_name": "Akoses / Medicinas",
    "category": {
      "id": 2,
      "name": "Akoses / Medicinas",
      "slug": "akoses-medicinas",
      "product_count": 74
    },
    "is_featured": false,
    "rating_avg": 4.89,
    "review_count": 9,
    "price": 500,
    "original_price": null,
    "discount_pct": null,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/akose-buburu-ati-osi-evitar-miseria-y-probreza.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/akose-buburu-ati-osi-evitar-miseria-y-probreza.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-AKOSEBUB-01",
        "stock": 10,
        "price": 500
      }
    ],
    "all_categories": [
      "akoses-medicinas"
    ]
  },
  {
    "id": 41,
    "slug": "akose-con-oti-antibrujeria",
    "sku": "OJA-AKOSECON",
    "name": "Akose con Oti / Antibrujeria",
    "description": "♦ Oti con Akose Antibrujeria de 750 ml. ⇒ Se va bebiendo diario y se puede rellenar hasta 2 ocasiones | • Los Akóses Yoruba son un componente importante de la medicina tradicional yoruba. • Los Akóses Yoruba se usan para tratar diversas dolencias y mantener la salud física, mental y energética y son una parte esencial de la tradición médica yoruba, que se basa en gran medida en la sabiduría ancestral y la experiencia acumulada a lo largo de generaciones.",
    "base_price": 861.21,
    "price_with_tax": 999,
    "effective_price": 999,
    "stock": 10,
    "category_name": "Akoses / Medicinas",
    "category": {
      "id": 2,
      "name": "Akoses / Medicinas",
      "slug": "akoses-medicinas",
      "product_count": 74
    },
    "is_featured": false,
    "rating_avg": 5,
    "review_count": 3,
    "price": 999,
    "original_price": null,
    "discount_pct": null,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/akose-con-oti-antibrujeria.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/akose-con-oti-antibrujeria.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-AKOSECON-01",
        "stock": 10,
        "price": 999
      }
    ],
    "all_categories": [
      "akoses-medicinas"
    ]
  },
  {
    "id": 42,
    "slug": "akose-iferan-atraccion",
    "sku": "OJA-AKOSEIFE",
    "name": "Akose Iferan / ATRACCION",
    "description": "Medicina de atracción del sexo opuesto. | Nota: No incluye Muñecos, se pueden usar cualquier par de muñecos de madera. | Aplicación: Incisiones y preparación de muñecos con la medicina.",
    "base_price": 1034.48,
    "price_with_tax": 1200,
    "effective_price": 1200,
    "stock": 10,
    "category_name": "Akoses / Medicinas",
    "category": {
      "id": 2,
      "name": "Akoses / Medicinas",
      "slug": "akoses-medicinas",
      "product_count": 74
    },
    "is_featured": false,
    "rating_avg": 5,
    "review_count": 3,
    "price": 1200,
    "original_price": null,
    "discount_pct": null,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/akose-iferan-atraccion.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/akose-iferan-atraccion.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-AKOSEIFE-01",
        "stock": 10,
        "price": 1200
      }
    ],
    "all_categories": [
      "akoses-medicinas"
    ]
  },
  {
    "id": 43,
    "slug": "asenso-laboral",
    "sku": "OJA-ASENSOLA",
    "name": "Akose Igbega Lenu Ise / ASENSO LABORAL",
    "description": "Medicina para obtener Asensos Laborales. | Uso: Incisiones, 7 para Mujer y 9 para Hombre en la Cabeza.",
    "base_price": 431.03,
    "price_with_tax": 500,
    "effective_price": 500,
    "stock": 10,
    "category_name": "Akoses / Medicinas",
    "category": {
      "id": 2,
      "name": "Akoses / Medicinas",
      "slug": "akoses-medicinas",
      "product_count": 74
    },
    "is_featured": false,
    "rating_avg": 5,
    "review_count": 4,
    "price": 500,
    "original_price": null,
    "discount_pct": null,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/akose-igbega-lenu-ise-asenso-laboral.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/akose-igbega-lenu-ise-asenso-laboral.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-ASENSOLA-01",
        "stock": 10,
        "price": 500
      }
    ],
    "all_categories": [
      "akoses-medicinas"
    ]
  },
  {
    "id": 44,
    "slug": "akose-iranti-memoria",
    "sku": "OJA-AKOSEIRA",
    "name": "Akose Iranti / MEMORIA",
    "description": "Medicina para la memoria | Aplicación: 101 Incisiones en la cabeza",
    "base_price": 431.03,
    "price_with_tax": 500,
    "effective_price": 500,
    "stock": 10,
    "category_name": "Akoses / Medicinas",
    "category": {
      "id": 2,
      "name": "Akoses / Medicinas",
      "slug": "akoses-medicinas",
      "product_count": 74
    },
    "is_featured": false,
    "rating_avg": 4.71,
    "review_count": 7,
    "price": 500,
    "original_price": null,
    "discount_pct": null,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/akose-iranti-memoria.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/akose-iranti-memoria.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-AKOSEIRA-01",
        "stock": 10,
        "price": 500
      }
    ],
    "all_categories": [
      "akoses-medicinas"
    ]
  },
  {
    "id": 45,
    "slug": "enviaciones-energeticas",
    "sku": "OJA-ENVIACIO",
    "name": "Akose Isora / PROTECCION CONTRA ENVIACIONES ENERGETICAS",
    "description": "Medicina para Protección Contra Enviaciones Energéticas y Brujeria | Uso: Incisiones, 7 para Mujer y 9 para Hombre en la Cabeza.",
    "base_price": 431.03,
    "price_with_tax": 500,
    "effective_price": 500,
    "stock": 10,
    "category_name": "Akoses / Medicinas",
    "category": {
      "id": 2,
      "name": "Akoses / Medicinas",
      "slug": "akoses-medicinas",
      "product_count": 74
    },
    "is_featured": false,
    "rating_avg": 5,
    "review_count": 2,
    "price": 500,
    "original_price": null,
    "discount_pct": null,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/akose-isora-proteccion-contra-enviaciones-energeticas.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/akose-isora-proteccion-contra-enviaciones-energeticas.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-ENVIACIO-01",
        "stock": 10,
        "price": 500
      }
    ],
    "all_categories": [
      "akoses-medicinas"
    ]
  },
  {
    "id": 46,
    "slug": "akose-iwori-meji",
    "sku": "OJA-AKOSEIWO",
    "name": "Akose Iwori Meji / DINERO y PRESTIGIO",
    "description": "♦ Medicina para prestigio y generar dinero. | • Aplicación: Incisiones en la parte superior de la mano.",
    "base_price": 431.03,
    "price_with_tax": 500,
    "effective_price": 500,
    "stock": 10,
    "category_name": "Akoses / Medicinas",
    "category": {
      "id": 2,
      "name": "Akoses / Medicinas",
      "slug": "akoses-medicinas",
      "product_count": 74
    },
    "is_featured": false,
    "rating_avg": 5,
    "review_count": 9,
    "price": 500,
    "original_price": null,
    "discount_pct": null,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/akose-iwori-meji-dinero-y-prestigio.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/akose-iwori-meji-dinero-y-prestigio.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-AKOSEIWO-01",
        "stock": 10,
        "price": 500
      }
    ],
    "all_categories": [
      "akoses-medicinas",
      "lo-nuevo"
    ]
  },
  {
    "id": 47,
    "slug": "akose-mandarikan-antibrujeria",
    "sku": "OJA-AKOSEMAN",
    "name": "Akose Mandarikan / ANTIBRUJERIA",
    "description": "Medicina Antibrujeria. | Aplicacion: Incisiones",
    "base_price": 431.03,
    "price_with_tax": 500,
    "effective_price": 500,
    "stock": 10,
    "category_name": "Akoses / Medicinas",
    "category": {
      "id": 2,
      "name": "Akoses / Medicinas",
      "slug": "akoses-medicinas",
      "product_count": 74
    },
    "is_featured": false,
    "rating_avg": 5,
    "review_count": 11,
    "price": 500,
    "original_price": null,
    "discount_pct": null,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/akose-mandarikan-antibrujeria.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/akose-mandarikan-antibrujeria.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-AKOSEMAN-01",
        "stock": 10,
        "price": 500
      }
    ],
    "all_categories": [
      "akoses-medicinas"
    ]
  },
  {
    "id": 48,
    "slug": "akose-osa-meji-antibrujeria",
    "sku": "OJA-AKOSEOSA",
    "name": "Akose Osa Meji / ANTIBRUJERIA",
    "description": "Medicina antibrujeria | Aplicación: Incisiones",
    "base_price": 431.03,
    "price_with_tax": 500,
    "effective_price": 500,
    "stock": 10,
    "category_name": "Akoses / Medicinas",
    "category": {
      "id": 2,
      "name": "Akoses / Medicinas",
      "slug": "akoses-medicinas",
      "product_count": 74
    },
    "is_featured": false,
    "rating_avg": 5,
    "review_count": 11,
    "price": 500,
    "original_price": null,
    "discount_pct": null,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/akose-osa-meji-antibrujeria.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/akose-osa-meji-antibrujeria.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-AKOSEOSA-01",
        "stock": 10,
        "price": 500
      }
    ],
    "all_categories": [
      "akoses-medicinas"
    ]
  },
  {
    "id": 49,
    "slug": "akose-owo-generar-dinero",
    "sku": "OJA-AKOSEOWO",
    "name": "Akose Owo / GENERAR DINERO",
    "description": "Medicina para atraer y generar dinero. | Aplicación: Incisiones en las muñecas.",
    "base_price": 431.03,
    "price_with_tax": 500,
    "effective_price": 500,
    "stock": 10,
    "category_name": "Akoses / Medicinas",
    "category": {
      "id": 2,
      "name": "Akoses / Medicinas",
      "slug": "akoses-medicinas",
      "product_count": 74
    },
    "is_featured": false,
    "rating_avg": 4.96,
    "review_count": 23,
    "price": 500,
    "original_price": null,
    "discount_pct": null,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/akose-owo-generar-dinero.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/akose-owo-generar-dinero.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-AKOSEOWO-01",
        "stock": 10,
        "price": 500
      }
    ],
    "all_categories": [
      "akoses-medicinas"
    ]
  },
  {
    "id": 50,
    "slug": "escape-accidente",
    "sku": "OJA-ESCAPEAC",
    "name": "Akose Owo Moto / PROTECCION DE ACCIDENTES AUTOMOVILISTICOS",
    "description": "Medicina para Proteger de Accidentes Automovilísticos. | Uso: Incisiones, 7 para Mujer y 9 para Hombre en la Cabeza.",
    "base_price": 431.03,
    "price_with_tax": 500,
    "effective_price": 500,
    "stock": 10,
    "category_name": "Akoses / Medicinas",
    "category": {
      "id": 2,
      "name": "Akoses / Medicinas",
      "slug": "akoses-medicinas",
      "product_count": 74
    },
    "is_featured": false,
    "rating_avg": 4.67,
    "review_count": 3,
    "price": 500,
    "original_price": null,
    "discount_pct": null,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/akose-owo-moto-proteccion-de-accidentes-automovilisticos.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/akose-owo-moto-proteccion-de-accidentes-automovilisticos.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-ESCAPEAC-01",
        "stock": 10,
        "price": 500
      }
    ],
    "all_categories": [
      "akoses-medicinas"
    ]
  },
  {
    "id": 51,
    "slug": "oyun-embarazo",
    "sku": "OJA-OYUNEMBA",
    "name": "Akose Oyun / EMBARAZO",
    "description": "♦ Medicina para quedar embarazada. | • Aplicación: Se toma una dosis diaria por la noche, se comienza a tomar una vez que termine su periodo menstrual. | • Uso: Tomado, 16 Tomas representa a 1 Dosis, Frasco con cantidad para 20 Tomas | • Nota: Precio Publicado equivale a 1 frasco",
    "base_price": 603.45,
    "price_with_tax": 700,
    "effective_price": 700,
    "stock": 10,
    "category_name": "Akoses / Medicinas",
    "category": {
      "id": 2,
      "name": "Akoses / Medicinas",
      "slug": "akoses-medicinas",
      "product_count": 74
    },
    "is_featured": false,
    "rating_avg": 5,
    "review_count": 2,
    "price": 700,
    "original_price": null,
    "discount_pct": null,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/akose-oyun-embarazo.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/akose-oyun-embarazo.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-OYUNEMBA-01",
        "stock": 10,
        "price": 700
      }
    ],
    "all_categories": [
      "akoses-medicinas"
    ]
  },
  {
    "id": 52,
    "slug": "akose-ciatica",
    "sku": "OJA-AKOSECIA",
    "name": "Akose para CIATICA",
    "description": "♦ Medicina para dolor de Ciática | • Uso: Tomado, 16 Tomas representa a 1 Dosis, Frasco con cantidad para 20 Tomas | Nota: Precio Publicado equivale a 1 frasco",
    "base_price": 862.07,
    "price_with_tax": 1000,
    "effective_price": 1000,
    "stock": 10,
    "category_name": "Akoses / Medicinas",
    "category": {
      "id": 2,
      "name": "Akoses / Medicinas",
      "slug": "akoses-medicinas",
      "product_count": 74
    },
    "is_featured": false,
    "rating_avg": 0,
    "review_count": 0,
    "price": 1000,
    "original_price": null,
    "discount_pct": null,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/akose-para-ciatica.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/akose-para-ciatica.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-AKOSECIA-01",
        "stock": 10,
        "price": 1000
      }
    ],
    "all_categories": [
      "akoses-medicinas",
      "lo-nuevo"
    ]
  },
  {
    "id": 53,
    "slug": "akose-circulacion-sanguinea",
    "sku": "OJA-AKOSECIR",
    "name": "Akose para CIRCULACION SANGUINEA",
    "description": "♦ Medicina para Circulación Sanguínea | • Uso: Tomado, 16 Tomas representa a 1 Dosis, Frasco con cantidad para 20 Tomas | Nota: Precio Publicado equivale a 1 frasco",
    "base_price": 862.07,
    "price_with_tax": 1000,
    "effective_price": 1000,
    "stock": 10,
    "category_name": "Akoses / Medicinas",
    "category": {
      "id": 2,
      "name": "Akoses / Medicinas",
      "slug": "akoses-medicinas",
      "product_count": 74
    },
    "is_featured": false,
    "rating_avg": 5,
    "review_count": 2,
    "price": 1000,
    "original_price": null,
    "discount_pct": null,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/akose-para-circulacion-sanguinea.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/akose-para-circulacion-sanguinea.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-AKOSECIR-01",
        "stock": 10,
        "price": 1000
      }
    ],
    "all_categories": [
      "akoses-medicinas",
      "lo-nuevo"
    ]
  },
  {
    "id": 54,
    "slug": "depurar-sangre",
    "sku": "OJA-DEPURARS",
    "name": "Akose para Depurar la Sangre",
    "description": "♦ Ayuda a depurar y limpiar la sangre, costo por 1 bolsa • 8 a 10 Grs (suficiente para las 3 tomas necesarias) | Uso: Se divide en 3 tomas y se ingiere con natilla, 1 ves al dia por 3 dias",
    "base_price": 861.21,
    "price_with_tax": 999,
    "effective_price": 999,
    "stock": 10,
    "category_name": "Akoses / Medicinas",
    "category": {
      "id": 2,
      "name": "Akoses / Medicinas",
      "slug": "akoses-medicinas",
      "product_count": 74
    },
    "is_featured": false,
    "rating_avg": 0,
    "review_count": 0,
    "price": 999,
    "original_price": 1500,
    "discount_pct": 33.4,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/akose-para-depurar-la-sangre.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/akose-para-depurar-la-sangre.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-DEPURARS-01",
        "stock": 10,
        "price": 999
      }
    ],
    "all_categories": [
      "akoses-medicinas",
      "lo-nuevo"
    ]
  },
  {
    "id": 55,
    "slug": "akose-osteoporosis",
    "sku": "OJA-AKOSEOST",
    "name": "Akose para OSTEOPOROSIS",
    "description": "♦ Medicina para la Osteoporosis | • Uso: Tomado, 16 Tomas representa a 1 Dosis, Frasco con cantidad para 20 Tomas | Nota: Precio Publicado equivale a 1 frasco",
    "base_price": 862.07,
    "price_with_tax": 1000,
    "effective_price": 1000,
    "stock": 10,
    "category_name": "Akoses / Medicinas",
    "category": {
      "id": 2,
      "name": "Akoses / Medicinas",
      "slug": "akoses-medicinas",
      "product_count": 74
    },
    "is_featured": false,
    "rating_avg": 5,
    "review_count": 0,
    "price": 1000,
    "original_price": null,
    "discount_pct": null,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/akose-para-osteoporosis.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/akose-para-osteoporosis.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-AKOSEOST-01",
        "stock": 10,
        "price": 1000
      }
    ],
    "all_categories": [
      "akoses-medicinas",
      "lo-nuevo"
    ]
  },
  {
    "id": 56,
    "slug": "akose-para-presion-arterial",
    "sku": "OJA-AKOSEPAR",
    "name": "Akose para PRESIÓN ARTERIAL",
    "description": "♦ Medicina para Presión Arterial | • Uso: Tomado, 16 Tomas representa a 1 Dosis, Frasco con cantidad para 20 Tomas | Nota: Precio Publicado equivale a 1 frasco",
    "base_price": 862.07,
    "price_with_tax": 1000,
    "effective_price": 1000,
    "stock": 10,
    "category_name": "Akoses / Medicinas",
    "category": {
      "id": 2,
      "name": "Akoses / Medicinas",
      "slug": "akoses-medicinas",
      "product_count": 74
    },
    "is_featured": false,
    "rating_avg": 0,
    "review_count": 0,
    "price": 1000,
    "original_price": null,
    "discount_pct": null,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/akose-para-presión-arterial.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/akose-para-presión-arterial.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-AKOSEPAR-01",
        "stock": 10,
        "price": 1000
      }
    ],
    "all_categories": [
      "akoses-medicinas",
      "lo-nuevo"
    ]
  },
  {
    "id": 57,
    "slug": "producir-esperma",
    "sku": "OJA-PRODUCIR",
    "name": "Akose para Producir mas Esperma",
    "description": "♦ Ayuda a producir mas esperma, ideal para quienes buscan tener hijos costo por 1 bolsa • 8 a 10 Grs (suficiente para las 3 tomas necesarias) | Uso: Se divide en 3 tomas y se ingiere con platano 1 ves al dia por 3 dias",
    "base_price": 861.21,
    "price_with_tax": 999,
    "effective_price": 999,
    "stock": 10,
    "category_name": "Akoses / Medicinas",
    "category": {
      "id": 2,
      "name": "Akoses / Medicinas",
      "slug": "akoses-medicinas",
      "product_count": 74
    },
    "is_featured": false,
    "rating_avg": 0,
    "review_count": 0,
    "price": 999,
    "original_price": 1500,
    "discount_pct": 33.4,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/akose-para-producir-mas-esperma.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/akose-para-producir-mas-esperma.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-PRODUCIR-01",
        "stock": 10,
        "price": 999
      }
    ],
    "all_categories": [
      "akoses-medicinas",
      "lo-nuevo"
    ]
  },
  {
    "id": 58,
    "slug": "akose-rinones",
    "sku": "OJA-AKOSERIN",
    "name": "Akose para RIÑONES",
    "description": "♦ Medicina para Riñones | • Uso: Tomado, 16 Tomas representa a 1 Dosis, Frasco con cantidad para 20 Tomas | Nota: Precio Publicado equivale a 1 frasco",
    "base_price": 862.07,
    "price_with_tax": 1000,
    "effective_price": 1000,
    "stock": 10,
    "category_name": "Akoses / Medicinas",
    "category": {
      "id": 2,
      "name": "Akoses / Medicinas",
      "slug": "akoses-medicinas",
      "product_count": 74
    },
    "is_featured": false,
    "rating_avg": 0,
    "review_count": 0,
    "price": 1000,
    "original_price": null,
    "discount_pct": null,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/akose-para-riñones.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/akose-para-riñones.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-AKOSERIN-01",
        "stock": 10,
        "price": 1000
      }
    ],
    "all_categories": [
      "akoses-medicinas",
      "lo-nuevo"
    ]
  },
  {
    "id": 59,
    "slug": "akose-trombosis",
    "sku": "OJA-AKOSETRO",
    "name": "Akose para TROMBOSIS",
    "description": "♦ Medicina para Trombosis | • Uso: Tomado, 16 Tomas representa a 1 Dosis, Frasco con cantidad para 20 Tomas | Nota: Precio Publicado equivale a 1 frasco",
    "base_price": 862.07,
    "price_with_tax": 1000,
    "effective_price": 1000,
    "stock": 10,
    "category_name": "Akoses / Medicinas",
    "category": {
      "id": 2,
      "name": "Akoses / Medicinas",
      "slug": "akoses-medicinas",
      "product_count": 74
    },
    "is_featured": false,
    "rating_avg": 0,
    "review_count": 0,
    "price": 1000,
    "original_price": null,
    "discount_pct": null,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/akose-para-trombosis.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/akose-para-trombosis.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-AKOSETRO-01",
        "stock": 10,
        "price": 1000
      }
    ],
    "all_categories": [
      "akoses-medicinas",
      "lo-nuevo"
    ]
  },
  {
    "id": 60,
    "slug": "akose-vitiligo",
    "sku": "OJA-AKOSEVIT",
    "name": "Akose para VITILIGO",
    "description": "♦ Medicina para Vitiligo | • Uso: Crema (la porción de akose enviada se mezcla con 1/2 Ltr de crema) Nota: Precio Publicado equivale a 1 Tratamiento",
    "base_price": 2155.17,
    "price_with_tax": 2500,
    "effective_price": 2500,
    "stock": 10,
    "category_name": "Akoses / Medicinas",
    "category": {
      "id": 2,
      "name": "Akoses / Medicinas",
      "slug": "akoses-medicinas",
      "product_count": 74
    },
    "is_featured": false,
    "rating_avg": 0,
    "review_count": 0,
    "price": 2500,
    "original_price": null,
    "discount_pct": null,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/akose-para-vitiligo.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/akose-para-vitiligo.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-AKOSEVIT-01",
        "stock": 10,
        "price": 2500
      }
    ],
    "all_categories": [
      "akoses-medicinas",
      "lo-nuevo"
    ]
  },
  {
    "id": 61,
    "slug": "apiru-ogun-iroke-ogun",
    "sku": "OJA-APIRUOGU",
    "name": "Apiru Ogun / Iroke Ogun",
    "description": "♦ Talla de Madera con tiras de piel de Aja | • 60 Cm de largo Aproximado.",
    "base_price": 1292.24,
    "price_with_tax": 1499,
    "effective_price": 1499,
    "stock": 10,
    "category_name": "Complementos y Herramientas",
    "category": {
      "id": 5,
      "name": "Complementos y Herramientas",
      "slug": "complementos-y-herramientas",
      "product_count": 45
    },
    "is_featured": false,
    "rating_avg": 0,
    "review_count": 0,
    "price": 1499,
    "original_price": null,
    "discount_pct": null,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/apiru-ogun-iroke-ogun.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/apiru-ogun-iroke-ogun.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-APIRUOGU-01",
        "stock": 10,
        "price": 1499
      }
    ],
    "all_categories": [
      "complementos-y-herramientas",
      "isan-iconos",
      "lo-nuevo"
    ]
  },
  {
    "id": 62,
    "slug": "hachas-de-sango",
    "sku": "OJA-HACHASDE",
    "name": "Àṣà Ṣàngó / 2 Hachas de Sango",
    "description": "Àṣà Ṣàngó, 2 Hachas, Piezas de Cedro Rojo | 26 Cm Altura y 17 Cm de Ancho",
    "base_price": 2326.72,
    "price_with_tax": 2699,
    "effective_price": 2699,
    "stock": 10,
    "category_name": "Complementos y Herramientas",
    "category": {
      "id": 5,
      "name": "Complementos y Herramientas",
      "slug": "complementos-y-herramientas",
      "product_count": 45
    },
    "is_featured": false,
    "rating_avg": 5,
    "review_count": 0,
    "price": 2699,
    "original_price": null,
    "discount_pct": null,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/àṣà-ṣàngó-2-hachas-de-sango.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/àṣà-ṣàngó-2-hachas-de-sango.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-HACHASDE-01",
        "stock": 10,
        "price": 2699
      }
    ],
    "all_categories": [
      "complementos-y-herramientas",
      "isan-iconos"
    ]
  },
  {
    "id": 63,
    "slug": "atare",
    "sku": "OJA-ATARE",
    "name": "Atare / Pimienta de Guinea",
    "description": "♦ Atare en Vaina. | Tamaño Mediana. | 8 Centímetros de larga Aproximadamente.",
    "base_price": 73.28,
    "price_with_tax": 85,
    "effective_price": 85,
    "stock": 10,
    "category_name": "Enseres",
    "category": {
      "id": 6,
      "name": "Enseres",
      "slug": "enseres",
      "product_count": 29
    },
    "is_featured": false,
    "rating_avg": 4.95,
    "review_count": 56,
    "price": 85,
    "original_price": null,
    "discount_pct": null,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/atare-pimienta-de-guinea.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/atare-pimienta-de-guinea.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-ATARE-01",
        "stock": 10,
        "price": 85
      }
    ],
    "all_categories": [
      "enseres",
      "semillas"
    ]
  },
  {
    "id": 64,
    "slug": "atipa-erufo",
    "sku": "OJA-ATIPAERU",
    "name": "Atipa / Erufo",
    "description": "♦ Atipa / Erufo / Orisa Pepe ⇒ Medidas: 40 x 20 cm Aprox | • Icono para adivinación, guía, despojos, orientación y muchas mas virtudes que tiene Atipa o Erufo",
    "base_price": 2585.34,
    "price_with_tax": 2999,
    "effective_price": 2999,
    "stock": 10,
    "category_name": "Akoses / Medicinas",
    "category": {
      "id": 2,
      "name": "Akoses / Medicinas",
      "slug": "akoses-medicinas",
      "product_count": 74
    },
    "is_featured": false,
    "rating_avg": 5,
    "review_count": 4,
    "price": 2999,
    "original_price": 5000,
    "discount_pct": 40,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/atipa-erufo.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/atipa-erufo.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-ATIPAERU-01",
        "stock": 10,
        "price": 2999
      }
    ],
    "all_categories": [
      "akoses-medicinas",
      "isan-iconos"
    ]
  },
  {
    "id": 65,
    "slug": "cazuela-hoyos",
    "sku": "OJA-CAZUELAH",
    "name": "Awe / Olla con Hoyos",
    "description": "Cazuela con Hoyos de 25 Cm de altura | Ideal para el Icono de Obaluaye",
    "base_price": 559.48,
    "price_with_tax": 649,
    "effective_price": 649,
    "stock": 10,
    "category_name": "Complementos y Herramientas",
    "category": {
      "id": 5,
      "name": "Complementos y Herramientas",
      "slug": "complementos-y-herramientas",
      "product_count": 45
    },
    "is_featured": false,
    "rating_avg": 0,
    "review_count": 0,
    "price": 649,
    "original_price": 1000,
    "discount_pct": 35.1,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/awe-olla-con-hoyos.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/awe-olla-con-hoyos.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-CAZUELAH-01",
        "stock": 10,
        "price": 649
      }
    ],
    "all_categories": [
      "complementos-y-herramientas",
      "isan-iconos"
    ]
  },
  {
    "id": 66,
    "slug": "cazuela-egbe",
    "sku": "OJA-CAZUELAE",
    "name": "Awe Egbe / Olla para Egbe",
    "description": "Cazuela de Egbe de 27 Cm de altura | Ideal para el Icono de Egbe",
    "base_price": 559.48,
    "price_with_tax": 649,
    "effective_price": 649,
    "stock": 10,
    "category_name": "Complementos y Herramientas",
    "category": {
      "id": 5,
      "name": "Complementos y Herramientas",
      "slug": "complementos-y-herramientas",
      "product_count": 45
    },
    "is_featured": false,
    "rating_avg": 5,
    "review_count": 7,
    "price": 649,
    "original_price": 1000,
    "discount_pct": 35.1,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/awe-egbe-olla-para-egbe.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/awe-egbe-olla-para-egbe.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-CAZUELAE-01",
        "stock": 10,
        "price": 649
      }
    ],
    "all_categories": [
      "complementos-y-herramientas",
      "isan-iconos"
    ]
  },
  {
    "id": 67,
    "slug": "awe-orisa-olla-para-orisa",
    "sku": "OJA-AWEORISA",
    "name": "Awe Orisa / Olla para Orisa",
    "description": "♦ Cazuela para Orisas de 27 Cm de altura",
    "base_price": 559.48,
    "price_with_tax": 649,
    "effective_price": 649,
    "stock": 10,
    "category_name": "Isan / Iconos",
    "category": {
      "id": 4,
      "name": "Isan / Iconos",
      "slug": "isan-iconos",
      "product_count": 67
    },
    "is_featured": false,
    "rating_avg": 0,
    "review_count": 0,
    "price": 649,
    "original_price": 1000,
    "discount_pct": 35.1,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/awe-orisa-olla-para-orisa.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/awe-orisa-olla-para-orisa.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-AWEORISA-01",
        "stock": 10,
        "price": 649
      }
    ],
    "all_categories": [
      "isan-iconos"
    ]
  },
  {
    "id": 68,
    "slug": "awon-alabara-atraer-clientes",
    "sku": "OJA-AWONALAB",
    "name": "Awon Alabara / Atraer Clientes",
    "description": "♦ Amuleto para generar ventas y atraer clientes a los negocios | • Uso: Se coloca detrás de la puerta del negocio o de la casa",
    "base_price": 862.07,
    "price_with_tax": 1000,
    "effective_price": 1000,
    "stock": 10,
    "category_name": "Akoses / Medicinas",
    "category": {
      "id": 2,
      "name": "Akoses / Medicinas",
      "slug": "akoses-medicinas",
      "product_count": 74
    },
    "is_featured": false,
    "rating_avg": 4.95,
    "review_count": 20,
    "price": 1000,
    "original_price": null,
    "discount_pct": null,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/awon-alabara-atraer-clientes.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/awon-alabara-atraer-clientes.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-AWONALAB-01",
        "stock": 10,
        "price": 1000
      }
    ],
    "all_categories": [
      "akoses-medicinas"
    ]
  },
  {
    "id": 69,
    "slug": "brazalete-bronce",
    "sku": "OJA-BRAZALET",
    "name": "Brazalete de Bronce",
    "description": "♦ Pieza de Bronce macizo. | • El brazalete de bronce asociado a Orisa Osun es una pieza de joyería de significado espiritual en la religión Yoruba. • Osun es una deidad importante en la tradición Yoruba, relacionada con el amor, la belleza, la fertilidad y el agua dulce. • Los brazaletes de bronce a menudo se asocian con Osun debido a su relación con el elemento del agua y la apreciación de la belleza y el arte en la cultura Yoruba",
    "base_price": 430.17,
    "price_with_tax": 499,
    "effective_price": 499,
    "stock": 10,
    "category_name": "Collares y Pulseras",
    "category": {
      "id": 3,
      "name": "Collares y Pulseras",
      "slug": "collares-y-pulseras",
      "product_count": 69
    },
    "is_featured": false,
    "rating_avg": 5,
    "review_count": 8,
    "price": 499,
    "original_price": null,
    "discount_pct": null,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/brazalete-de-bronce.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/brazalete-de-bronce.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-BRAZALET-01",
        "stock": 10,
        "price": 499
      }
    ],
    "all_categories": [
      "collares-y-pulseras",
      "complementos-y-herramientas"
    ]
  },
  {
    "id": 70,
    "slug": "brazalete-de-bronce-ancho",
    "sku": "OJA-BRAZALET",
    "name": "Brazalete de Bronce Ancho",
    "description": "♦ Pieza de Bronce macizo. Medidas: 1.7 cm grosor y 10 cm de ancho (ajustable a la muñeca) | • El brazalete de bronce asociado a Orisa Osun es una pieza de joyería de significado espiritual en la religión Yoruba. • Osun es una deidad importante en la tradición Yoruba, relacionada con el amor, la belleza, la fertilidad y el agua dulce.",
    "base_price": 775,
    "price_with_tax": 899,
    "effective_price": 899,
    "stock": 10,
    "category_name": "Collares y Pulseras",
    "category": {
      "id": 3,
      "name": "Collares y Pulseras",
      "slug": "collares-y-pulseras",
      "product_count": 69
    },
    "is_featured": false,
    "rating_avg": 0,
    "review_count": 0,
    "price": 899,
    "original_price": 1300,
    "discount_pct": 30.8,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/brazalete-de-bronce-ancho.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/brazalete-de-bronce-ancho.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-BRAZALET-01",
        "stock": 10,
        "price": 899
      }
    ],
    "all_categories": [
      "collares-y-pulseras",
      "complementos-y-herramientas",
      "lo-nuevo"
    ]
  },
  {
    "id": 71,
    "slug": "brazalete-de-plomo",
    "sku": "OJA-BRAZALET",
    "name": "Brazalete de Plomo",
    "description": "♦ Pieza de Plomo. Mod-01: Flexible, se ajusta a la mano. Mod-02: Grueso y Solido. 9 a 11 cm diámetro. Mod-03: Grueso, forma torcido, 9 a 11 cm diámetro. | • El brazalete de Plomo asociado a Orisa Obatala es una pieza de joyería de significado espiritual en la religión Yoruba. • Los brazaletes de Plomo a menudo se asocian con Obatala, son parte de las decoraciones que los seguidores del Orisa usan en la cultura Yoruba",
    "base_price": 387.07,
    "price_with_tax": 449,
    "effective_price": 449,
    "stock": 10,
    "category_name": "Collares y Pulseras",
    "category": {
      "id": 3,
      "name": "Collares y Pulseras",
      "slug": "collares-y-pulseras",
      "product_count": 69
    },
    "is_featured": false,
    "rating_avg": 5,
    "review_count": 3,
    "price": 449,
    "original_price": null,
    "discount_pct": null,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/brazalete-de-plomo.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/brazalete-de-plomo.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-BRAZALET-01",
        "stock": 10,
        "price": 449
      }
    ],
    "all_categories": [
      "collares-y-pulseras"
    ]
  },
  {
    "id": 72,
    "slug": "campana-de-metal-grande",
    "sku": "OJA-CAMPANAD",
    "name": "Campana Grande",
    "description": "♦ Campana de Latón Alta | • Mide 35 Cm de Altura",
    "base_price": 818.1,
    "price_with_tax": 949,
    "effective_price": 949,
    "stock": 10,
    "category_name": "Complementos y Herramientas",
    "category": {
      "id": 5,
      "name": "Complementos y Herramientas",
      "slug": "complementos-y-herramientas",
      "product_count": 45
    },
    "is_featured": false,
    "rating_avg": 0,
    "review_count": 0,
    "price": 949,
    "original_price": 1500,
    "discount_pct": 36.7,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/campana-grande.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/campana-grande.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-CAMPANAD-01",
        "stock": 10,
        "price": 949
      }
    ],
    "all_categories": [
      "complementos-y-herramientas",
      "lo-nuevo",
      "varios"
    ]
  },
  {
    "id": 73,
    "slug": "campana-de-metal-mediana",
    "sku": "OJA-CAMPANAD",
    "name": "Campana Mediana",
    "description": "♦ Campana de Latón Mediana | • Mide 20 Cm de Altura",
    "base_price": 731.9,
    "price_with_tax": 849,
    "effective_price": 849,
    "stock": 10,
    "category_name": "Complementos y Herramientas",
    "category": {
      "id": 5,
      "name": "Complementos y Herramientas",
      "slug": "complementos-y-herramientas",
      "product_count": 45
    },
    "is_featured": false,
    "rating_avg": 0,
    "review_count": 0,
    "price": 849,
    "original_price": 1200,
    "discount_pct": 29.2,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/campana-mediana.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/campana-mediana.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-CAMPANAD-01",
        "stock": 10,
        "price": 849
      }
    ],
    "all_categories": [
      "complementos-y-herramientas",
      "lo-nuevo",
      "varios"
    ]
  },
  {
    "id": 74,
    "slug": "cauri-abierto",
    "sku": "OJA-CAURIABI",
    "name": "Cauri 1 Kilo / Caracol Abierto",
    "description": "♦ Caracol Abierto Mediano | • 1 Kilogramo.",
    "base_price": 688.79,
    "price_with_tax": 799,
    "effective_price": 799,
    "stock": 10,
    "category_name": "Enseres",
    "category": {
      "id": 6,
      "name": "Enseres",
      "slug": "enseres",
      "product_count": 29
    },
    "is_featured": false,
    "rating_avg": 4.94,
    "review_count": 18,
    "price": 799,
    "original_price": null,
    "discount_pct": null,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/cauri-1-kilo-caracol-abierto.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/cauri-1-kilo-caracol-abierto.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-CAURIABI-01",
        "stock": 10,
        "price": 799
      }
    ],
    "all_categories": [
      "enseres"
    ]
  },
  {
    "id": 75,
    "slug": "arenilla-rojo",
    "sku": "OJA-ARENILLA",
    "name": "Collar Arenilla Rojo",
    "description": "♦ Collar de cristal Arenilla Rojo | • Ideal para obtener Jerarquía, Respeto, Honor, vinculado con Orisas como Sango, Oya, Esu",
    "base_price": 559.48,
    "price_with_tax": 649,
    "effective_price": 649,
    "stock": 10,
    "category_name": "Collares y Pulseras",
    "category": {
      "id": 3,
      "name": "Collares y Pulseras",
      "slug": "collares-y-pulseras",
      "product_count": 69
    },
    "is_featured": false,
    "rating_avg": 5,
    "review_count": 2,
    "price": 649,
    "original_price": null,
    "discount_pct": null,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/collar-arenilla-rojo.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/collar-arenilla-rojo.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-ARENILLA-01",
        "stock": 10,
        "price": 649
      }
    ],
    "all_categories": [
      "collares-y-pulseras"
    ]
  },
  {
    "id": 76,
    "slug": "collar-de-arenilla-amarillo",
    "sku": "OJA-COLLARDE",
    "name": "Collar de Arenilla Amarillo",
    "description": "Collar de cristal Arenilla Amarillo | Referente a Osun",
    "base_price": 559.48,
    "price_with_tax": 649,
    "effective_price": 649,
    "stock": 10,
    "category_name": "Collares y Pulseras",
    "category": {
      "id": 3,
      "name": "Collares y Pulseras",
      "slug": "collares-y-pulseras",
      "product_count": 69
    },
    "is_featured": false,
    "rating_avg": 0,
    "review_count": 0,
    "price": 649,
    "original_price": null,
    "discount_pct": null,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/collar-de-arenilla-amarillo.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/collar-de-arenilla-amarillo.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-COLLARDE-01",
        "stock": 10,
        "price": 649
      }
    ],
    "all_categories": [
      "collares-y-pulseras"
    ]
  },
  {
    "id": 77,
    "slug": "arenilla-azul",
    "sku": "OJA-ARENILLA",
    "name": "Collar de Arenilla Azul",
    "description": "Collar de cristal Arenilla Azul | Ideal para propiciar la riqueza, vinculado con Orisas como Egbe, Yemoja, Olokun",
    "base_price": 559.48,
    "price_with_tax": 649,
    "effective_price": 649,
    "stock": 10,
    "category_name": "Collares y Pulseras",
    "category": {
      "id": 3,
      "name": "Collares y Pulseras",
      "slug": "collares-y-pulseras",
      "product_count": 69
    },
    "is_featured": false,
    "rating_avg": 5,
    "review_count": 0,
    "price": 649,
    "original_price": null,
    "discount_pct": null,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/collar-de-arenilla-azul.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/collar-de-arenilla-azul.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-ARENILLA-01",
        "stock": 10,
        "price": 649
      }
    ],
    "all_categories": [
      "collares-y-pulseras"
    ]
  },
  {
    "id": 78,
    "slug": "collar-de-arenilla-blanco",
    "sku": "OJA-COLLARDE",
    "name": "Collar de Arenilla Blanco",
    "description": "Collar de cristal Arenilla Blanco | Ideal para propiciar la riqueza, y la estabilidad vinculado con Orisas como Obatala, Orisa Aje",
    "base_price": 559.48,
    "price_with_tax": 649,
    "effective_price": 649,
    "stock": 10,
    "category_name": "Collares y Pulseras",
    "category": {
      "id": 3,
      "name": "Collares y Pulseras",
      "slug": "collares-y-pulseras",
      "product_count": 69
    },
    "is_featured": false,
    "rating_avg": 4.67,
    "review_count": 3,
    "price": 649,
    "original_price": null,
    "discount_pct": null,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/collar-de-arenilla-blanco.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/collar-de-arenilla-blanco.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-COLLARDE-01",
        "stock": 10,
        "price": 649
      }
    ],
    "all_categories": [
      "collares-y-pulseras"
    ]
  },
  {
    "id": 79,
    "slug": "collar-de-arenilla-cafe",
    "sku": "OJA-COLLARDE",
    "name": "Collar de Arenilla Cafe",
    "description": "♦ Collar de cristal Arenilla Cafe | • Referente a Oya",
    "base_price": 559.48,
    "price_with_tax": 649,
    "effective_price": 649,
    "stock": 10,
    "category_name": "Collares y Pulseras",
    "category": {
      "id": 3,
      "name": "Collares y Pulseras",
      "slug": "collares-y-pulseras",
      "product_count": 69
    },
    "is_featured": false,
    "rating_avg": 0,
    "review_count": 0,
    "price": 649,
    "original_price": null,
    "discount_pct": null,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/collar-de-arenilla-cafe.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/collar-de-arenilla-cafe.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-COLLARDE-01",
        "stock": 10,
        "price": 649
      }
    ],
    "all_categories": [
      "collares-y-pulseras"
    ]
  },
  {
    "id": 80,
    "slug": "collar-de-arenilla-negro-blanco",
    "sku": "OJA-COLLARDE",
    "name": "Collar de Arenilla Negro y Blanco",
    "description": "♦ Collar de cristal Arenilla | • Referente a Esu",
    "base_price": 559.48,
    "price_with_tax": 649,
    "effective_price": 649,
    "stock": 10,
    "category_name": "Collares y Pulseras",
    "category": {
      "id": 3,
      "name": "Collares y Pulseras",
      "slug": "collares-y-pulseras",
      "product_count": 69
    },
    "is_featured": false,
    "rating_avg": 0,
    "review_count": 0,
    "price": 649,
    "original_price": null,
    "discount_pct": null,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/collar-de-arenilla-negro-y-blanco.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/collar-de-arenilla-negro-y-blanco.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-COLLARDE-01",
        "stock": 10,
        "price": 649
      }
    ],
    "all_categories": [
      "collares-y-pulseras"
    ]
  },
  {
    "id": 81,
    "slug": "collar-cauris",
    "sku": "OJA-COLLARCA",
    "name": "Collar de Cauris",
    "description": "Collar de Cauri, ideal para Orisa Aje | 37 Cm de Largo (Doblado)",
    "base_price": 731.9,
    "price_with_tax": 849,
    "effective_price": 849,
    "stock": 10,
    "category_name": "Collares y Pulseras",
    "category": {
      "id": 3,
      "name": "Collares y Pulseras",
      "slug": "collares-y-pulseras",
      "product_count": 69
    },
    "is_featured": false,
    "rating_avg": 5,
    "review_count": 0,
    "price": 849,
    "original_price": 1200,
    "discount_pct": 29.2,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/collar-de-cauris.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/collar-de-cauris.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-COLLARCA-01",
        "stock": 10,
        "price": 849
      }
    ],
    "all_categories": [
      "collares-y-pulseras"
    ]
  },
  {
    "id": 82,
    "slug": "collar-egbe",
    "sku": "OJA-COLLAREG",
    "name": "Collar de Egbe Cuenta Chica",
    "description": "♦ Collar de cristal Arenilla Multicolor | • 47 Cm de largo | • Ideal para propiciar la prosperidad, y la estabilidad vinculado con Orisas como Egbe y con Egungun",
    "base_price": 257.76,
    "price_with_tax": 299,
    "effective_price": 299,
    "stock": 10,
    "category_name": "Collares y Pulseras",
    "category": {
      "id": 3,
      "name": "Collares y Pulseras",
      "slug": "collares-y-pulseras",
      "product_count": 69
    },
    "is_featured": false,
    "rating_avg": 5,
    "review_count": 5,
    "price": 299,
    "original_price": 400,
    "discount_pct": 25.2,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/collar-de-egbe-cuenta-chica.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/collar-de-egbe-cuenta-chica.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-COLLAREG-01",
        "stock": 10,
        "price": 299
      }
    ],
    "all_categories": [
      "collares-y-pulseras"
    ]
  },
  {
    "id": 83,
    "slug": "egbe-grande",
    "sku": "OJA-EGBEGRAN",
    "name": "Collar de Egbe Cuenta Grande",
    "description": "Collar de cristal Arenilla Multicolor cuenta Grande | 47 Cm de largo | Collar de Cuenta Grande Africana | Ideal para propiciar la prosperidad, y la estabilidad vinculado con Orisas como Egbe y con Egungun",
    "base_price": 818.1,
    "price_with_tax": 949,
    "effective_price": 949,
    "stock": 10,
    "category_name": "Collares y Pulseras",
    "category": {
      "id": 3,
      "name": "Collares y Pulseras",
      "slug": "collares-y-pulseras",
      "product_count": 69
    },
    "is_featured": false,
    "rating_avg": 5,
    "review_count": 6,
    "price": 949,
    "original_price": null,
    "discount_pct": null,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/collar-de-egbe-cuenta-grande.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/collar-de-egbe-cuenta-grande.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-EGBEGRAN-01",
        "stock": 10,
        "price": 949
      }
    ],
    "all_categories": [
      "collares-y-pulseras"
    ]
  },
  {
    "id": 84,
    "slug": "collar-de-egbe-cuenta-jumbo",
    "sku": "OJA-COLLARDE",
    "name": "Collar de Egbe Cuenta Jumbo",
    "description": "♦ Collar de cristal Multicolor cuenta Jumbo | 35 Cm de largo | Collar de Cuenta Jumbo Africana | Ideal para la prosperidad, y la estabilidad vinculado con Orisas como Egbe y con Egungun",
    "base_price": 1033.62,
    "price_with_tax": 1199,
    "effective_price": 1199,
    "stock": 10,
    "category_name": "Collares y Pulseras",
    "category": {
      "id": 3,
      "name": "Collares y Pulseras",
      "slug": "collares-y-pulseras",
      "product_count": 69
    },
    "is_featured": false,
    "rating_avg": 0,
    "review_count": 0,
    "price": 1199,
    "original_price": null,
    "discount_pct": null,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/collar-de-egbe-cuenta-jumbo.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/collar-de-egbe-cuenta-jumbo.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-COLLARDE-01",
        "stock": 10,
        "price": 1199
      }
    ],
    "all_categories": [
      "collares-y-pulseras",
      "lo-nuevo"
    ]
  },
  {
    "id": 85,
    "slug": "collar-de-egungun",
    "sku": "OJA-COLLARDE",
    "name": "Collar de Egungun",
    "description": "♦ Collar de Egungun | • Collar Africano de Egungun, Cuenta Cilindrica",
    "base_price": 387.07,
    "price_with_tax": 449,
    "effective_price": 449,
    "stock": 10,
    "category_name": "Collares y Pulseras",
    "category": {
      "id": 3,
      "name": "Collares y Pulseras",
      "slug": "collares-y-pulseras",
      "product_count": 69
    },
    "is_featured": false,
    "rating_avg": 5,
    "review_count": 0,
    "price": 449,
    "original_price": null,
    "discount_pct": null,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/collar-de-egungun.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/collar-de-egungun.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-COLLARDE-01",
        "stock": 10,
        "price": 449
      }
    ],
    "all_categories": [
      "collares-y-pulseras"
    ]
  },
  {
    "id": 86,
    "slug": "collar-de-iyun-azul",
    "sku": "OJA-COLLARDE",
    "name": "Collar de Iyun Azul",
    "description": "♦ Collar de Iyun Azul cuenta Grande | • Ideal para Orisa Olokun, Yemoja, Egbe, Aje | Medida >> 36 Cm de Largo.",
    "base_price": 645.69,
    "price_with_tax": 749,
    "effective_price": 749,
    "stock": 10,
    "category_name": "Collares y Pulseras",
    "category": {
      "id": 3,
      "name": "Collares y Pulseras",
      "slug": "collares-y-pulseras",
      "product_count": 69
    },
    "is_featured": false,
    "rating_avg": 4.75,
    "review_count": 4,
    "price": 749,
    "original_price": null,
    "discount_pct": null,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/collar-de-iyun-azul.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/collar-de-iyun-azul.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-COLLARDE-01",
        "stock": 10,
        "price": 749
      }
    ],
    "all_categories": [
      "collares-y-pulseras"
    ]
  },
  {
    "id": 87,
    "slug": "collar-de-iyun-blanco",
    "sku": "OJA-COLLARDE",
    "name": "Collar de Iyun Blanco",
    "description": "♦ Collar de Iyun Blanco cuenta Grande | • Ideal para > Orisanla (Obatala), Aje, Odudua, Olokun | • Medida >> 36 Cm de Largo.",
    "base_price": 645.69,
    "price_with_tax": 749,
    "effective_price": 749,
    "stock": 10,
    "category_name": "Collares y Pulseras",
    "category": {
      "id": 3,
      "name": "Collares y Pulseras",
      "slug": "collares-y-pulseras",
      "product_count": 69
    },
    "is_featured": false,
    "rating_avg": 0,
    "review_count": 0,
    "price": 749,
    "original_price": null,
    "discount_pct": null,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/collar-de-iyun-blanco.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/collar-de-iyun-blanco.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-COLLARDE-01",
        "stock": 10,
        "price": 749
      }
    ],
    "all_categories": [
      "collares-y-pulseras"
    ]
  },
  {
    "id": 88,
    "slug": "collar-de-iyun-rojo",
    "sku": "OJA-COLLARDE",
    "name": "Collar de Iyun Rojo",
    "description": "Collar de Iyun Rojo cuenta Grande | Ideal para Sango, Oya | Medida >> 36 Cm de Largo.",
    "base_price": 645.69,
    "price_with_tax": 749,
    "effective_price": 749,
    "stock": 10,
    "category_name": "Collares y Pulseras",
    "category": {
      "id": 3,
      "name": "Collares y Pulseras",
      "slug": "collares-y-pulseras",
      "product_count": 69
    },
    "is_featured": false,
    "rating_avg": 5,
    "review_count": 0,
    "price": 749,
    "original_price": null,
    "discount_pct": null,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/collar-de-iyun-rojo.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/collar-de-iyun-rojo.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-COLLARDE-01",
        "stock": 10,
        "price": 749
      }
    ],
    "all_categories": [
      "collares-y-pulseras"
    ]
  },
  {
    "id": 89,
    "slug": "collar-de-segi-ch",
    "sku": "OJA-COLLARDE",
    "name": "Collar de Segi Cuenta Chica",
    "description": "♦ Collar de Segi Original | Nota: Oferta de Cuenta Chica | 30 Cm de largo Aproximado | Ideal para propiciar la prosperidad y la Riqueza",
    "base_price": 1119.83,
    "price_with_tax": 1299,
    "effective_price": 1299,
    "stock": 10,
    "category_name": "Collares y Pulseras",
    "category": {
      "id": 3,
      "name": "Collares y Pulseras",
      "slug": "collares-y-pulseras",
      "product_count": 69
    },
    "is_featured": false,
    "rating_avg": 4.67,
    "review_count": 3,
    "price": 1299,
    "original_price": 2200,
    "discount_pct": 41,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/collar-de-segi-cuenta-chica.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/collar-de-segi-cuenta-chica.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-COLLARDE-01",
        "stock": 10,
        "price": 1299
      }
    ],
    "all_categories": [
      "collares-y-pulseras"
    ]
  },
  {
    "id": 90,
    "slug": "collar-de-segi-cuenta-grande",
    "sku": "OJA-COLLARDE",
    "name": "Collar de Segi Cuenta Grande",
    "description": "♦ Collar de Segi Original | Nota: Oferta de Cuenta Grande | 35 Cm de largo Aproximado | • Ideal para propiciar la prosperidad y la Riqueza",
    "base_price": 1550.86,
    "price_with_tax": 1799,
    "effective_price": 1799,
    "stock": 10,
    "category_name": "Collares y Pulseras",
    "category": {
      "id": 3,
      "name": "Collares y Pulseras",
      "slug": "collares-y-pulseras",
      "product_count": 69
    },
    "is_featured": false,
    "rating_avg": 0,
    "review_count": 0,
    "price": 1799,
    "original_price": 2200,
    "discount_pct": 18.2,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/collar-de-segi-cuenta-grande.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/collar-de-segi-cuenta-grande.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-COLLARDE-01",
        "stock": 10,
        "price": 1799
      }
    ],
    "all_categories": [
      "collares-y-pulseras",
      "lo-nuevo"
    ]
  },
  {
    "id": 91,
    "slug": "collar-segi",
    "sku": "OJA-COLLARSE",
    "name": "Collar de Segi Cuenta Mediana",
    "description": "♦ Collar de Segi Original | • Nota: Oferta de Cuenta Mediana | • 30 Cm de largo Aproximado | • Ideal para propiciar la prosperidad y la Riqueza",
    "base_price": 1292.24,
    "price_with_tax": 1499,
    "effective_price": 1499,
    "stock": 10,
    "category_name": "Collares y Pulseras",
    "category": {
      "id": 3,
      "name": "Collares y Pulseras",
      "slug": "collares-y-pulseras",
      "product_count": 69
    },
    "is_featured": false,
    "rating_avg": 5,
    "review_count": 7,
    "price": 1499,
    "original_price": 2300,
    "discount_pct": 34.8,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/collar-de-segi-cuenta-mediana.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/collar-de-segi-cuenta-mediana.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-COLLARSE-01",
        "stock": 10,
        "price": 1499
      }
    ],
    "all_categories": [
      "collares-y-pulseras"
    ]
  },
  {
    "id": 92,
    "slug": "collar-de-iyun-coral",
    "sku": "OJA-COLLARDE",
    "name": "Collar Iyun con Coral",
    "description": "♦ 37 cm Doblado",
    "base_price": 904.31,
    "price_with_tax": 1049,
    "effective_price": 1049,
    "stock": 10,
    "category_name": "Collares y Pulseras",
    "category": {
      "id": 3,
      "name": "Collares y Pulseras",
      "slug": "collares-y-pulseras",
      "product_count": 69
    },
    "is_featured": false,
    "rating_avg": 5,
    "review_count": 2,
    "price": 1049,
    "original_price": null,
    "discount_pct": null,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/collar-iyun-con-coral.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/collar-iyun-con-coral.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-COLLARDE-01",
        "stock": 10,
        "price": 1049
      }
    ],
    "all_categories": [
      "collares-y-pulseras"
    ]
  },
  {
    "id": 93,
    "slug": "collar-obatala",
    "sku": "OJA-COLLAROB",
    "name": "Collar Obatala Cuenta Grande",
    "description": "♦ Ilekes de Orisa de cuenta Grande | • 37 Cm de Largo",
    "base_price": 300.86,
    "price_with_tax": 349,
    "effective_price": 349,
    "stock": 10,
    "category_name": "Collares y Pulseras",
    "category": {
      "id": 3,
      "name": "Collares y Pulseras",
      "slug": "collares-y-pulseras",
      "product_count": 69
    },
    "is_featured": false,
    "rating_avg": 0,
    "review_count": 0,
    "price": 349,
    "original_price": 500,
    "discount_pct": 30.2,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/collar-obatala-cuenta-grande.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/collar-obatala-cuenta-grande.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-COLLAROB-01",
        "stock": 10,
        "price": 349
      }
    ],
    "all_categories": [
      "collares-y-pulseras"
    ]
  },
  {
    "id": 94,
    "slug": "collar-ogun",
    "sku": "OJA-COLLAROG",
    "name": "Collar Ogun Cuenta Grande",
    "description": "♦ Ilekes de Orisa de cuenta Grande | • 37 Cm de Largo",
    "base_price": 300.86,
    "price_with_tax": 349,
    "effective_price": 349,
    "stock": 10,
    "category_name": "Collares y Pulseras",
    "category": {
      "id": 3,
      "name": "Collares y Pulseras",
      "slug": "collares-y-pulseras",
      "product_count": 69
    },
    "is_featured": false,
    "rating_avg": 0,
    "review_count": 0,
    "price": 349,
    "original_price": 500,
    "discount_pct": 30.2,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/collar-ogun-cuenta-grande.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/collar-ogun-cuenta-grande.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-COLLAROG-01",
        "stock": 10,
        "price": 349
      }
    ],
    "all_categories": [
      "collares-y-pulseras"
    ]
  },
  {
    "id": 95,
    "slug": "collar-orumila-arenilla",
    "sku": "OJA-COLLAROR",
    "name": "Collar Orula Arenilla",
    "description": "♦ Elaborado con cuentas de Arenilla de tamaño mediano que combinan el vibrante color verde y el cafe. (Orula) • Medida: 33 cm de largo",
    "base_price": 559.48,
    "price_with_tax": 649,
    "effective_price": 649,
    "stock": 10,
    "category_name": "Collares de Orumila",
    "category": {
      "id": 7,
      "name": "Collares de Orumila",
      "slug": "collares-de-orumila",
      "product_count": 18
    },
    "is_featured": false,
    "rating_avg": 0,
    "review_count": 0,
    "price": 649,
    "original_price": null,
    "discount_pct": null,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/collar-orula-arenilla.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/collar-orula-arenilla.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-COLLAROR-01",
        "stock": 10,
        "price": 649
      }
    ],
    "all_categories": [
      "collares-de-orumila",
      "collares-y-pulseras",
      "lo-nuevo"
    ]
  },
  {
    "id": 96,
    "slug": "collar-orula-coral",
    "sku": "OJA-COLLAROR",
    "name": "Collar Orula con Coral",
    "description": "♦ Elaborado con cuentas de Otutu Opon Grande con Coral que combinan el vibrante color verde y el cafe. (Orula) • Medida: 35 cm de largo",
    "base_price": 387.07,
    "price_with_tax": 449,
    "effective_price": 449,
    "stock": 10,
    "category_name": "Collares de Orumila",
    "category": {
      "id": 7,
      "name": "Collares de Orumila",
      "slug": "collares-de-orumila",
      "product_count": 18
    },
    "is_featured": false,
    "rating_avg": 0,
    "review_count": 0,
    "price": 449,
    "original_price": 800,
    "discount_pct": 43.9,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/collar-orula-con-coral.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/collar-orula-con-coral.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-COLLAROR-01",
        "stock": 10,
        "price": 449
      }
    ],
    "all_categories": [
      "collares-de-orumila",
      "collares-y-pulseras",
      "lo-nuevo"
    ]
  },
  {
    "id": 97,
    "slug": "collar-orumila-con-segi",
    "sku": "OJA-COLLAROR",
    "name": "Collar Orula con Segi",
    "description": "♦ Elaborado con cuentas de Otutu Opon de tamaño mediano que combinan el vibrante color verde y el cafe. (Orula) Medida: 45 cm de largo | Características: | Incluye la preciada cuenta de Segi, un elemento clave para la riqueza y la conexión espiritual.",
    "base_price": 473.28,
    "price_with_tax": 549,
    "effective_price": 549,
    "stock": 10,
    "category_name": "Collares de Orumila",
    "category": {
      "id": 7,
      "name": "Collares de Orumila",
      "slug": "collares-de-orumila",
      "product_count": 18
    },
    "is_featured": false,
    "rating_avg": 0,
    "review_count": 0,
    "price": 549,
    "original_price": 800,
    "discount_pct": 31.4,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/collar-orula-con-segi.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/collar-orula-con-segi.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-COLLAROR-01",
        "stock": 10,
        "price": 549
      }
    ],
    "all_categories": [
      "collares-de-orumila",
      "collares-y-pulseras",
      "lo-nuevo"
    ]
  },
  {
    "id": 98,
    "slug": "collar-orula-ikin-iyun",
    "sku": "OJA-COLLAROR",
    "name": "Collar Orula Ikin e Iyun",
    "description": "♦ Elaborado con cuentas de Otutu Opon Grande, Ikin e Iyun que combinan el vibrante color verde y el cafe. (Orula) • Medida: 35 cm de largo",
    "base_price": 387.07,
    "price_with_tax": 449,
    "effective_price": 449,
    "stock": 10,
    "category_name": "Collares de Orumila",
    "category": {
      "id": 7,
      "name": "Collares de Orumila",
      "slug": "collares-de-orumila",
      "product_count": 18
    },
    "is_featured": false,
    "rating_avg": 0,
    "review_count": 0,
    "price": 449,
    "original_price": 800,
    "discount_pct": 43.9,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/collar-orula-ikin-e-iyun.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/collar-orula-ikin-e-iyun.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-COLLAROR-01",
        "stock": 10,
        "price": 449
      }
    ],
    "all_categories": [
      "collares-de-orumila",
      "collares-y-pulseras",
      "lo-nuevo"
    ]
  },
  {
    "id": 99,
    "slug": "collar-orula-ikin-cauri-gde",
    "sku": "OJA-COLLAROR",
    "name": "Collar Orula Ikin y Cauri Cuenta Gde",
    "description": "♦ Elaborado con cuentas de Otutu Opon, Ikin y Cauris que combinan el vibrante color verde y el cafe. (Orula) • Medida: 35 cm de largo",
    "base_price": 387.07,
    "price_with_tax": 449,
    "effective_price": 449,
    "stock": 10,
    "category_name": "Collares de Orumila",
    "category": {
      "id": 7,
      "name": "Collares de Orumila",
      "slug": "collares-de-orumila",
      "product_count": 18
    },
    "is_featured": false,
    "rating_avg": 0,
    "review_count": 0,
    "price": 449,
    "original_price": 800,
    "discount_pct": 43.9,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/collar-orula-ikin-y-cauri-cuenta-gde.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/collar-orula-ikin-y-cauri-cuenta-gde.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-COLLAROR-01",
        "stock": 10,
        "price": 449
      }
    ],
    "all_categories": [
      "collares-de-orumila",
      "collares-y-pulseras",
      "lo-nuevo"
    ]
  },
  {
    "id": 100,
    "slug": "collar-orula-ikin-y-cauri-med",
    "sku": "OJA-COLLAROR",
    "name": "Collar Orula Ikin y Cauri Cuenta Med",
    "description": "♦ Elaborado con cuentas de Otutu Opon, Ikin y Cauris que combinan el vibrante color verde y el cafe. (Orula) • Medida: 35 cm de largo",
    "base_price": 387.07,
    "price_with_tax": 449,
    "effective_price": 449,
    "stock": 10,
    "category_name": "Collares de Orumila",
    "category": {
      "id": 7,
      "name": "Collares de Orumila",
      "slug": "collares-de-orumila",
      "product_count": 18
    },
    "is_featured": false,
    "rating_avg": 0,
    "review_count": 0,
    "price": 449,
    "original_price": 800,
    "discount_pct": 43.9,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/collar-orula-ikin-y-cauri-cuenta-med.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/collar-orula-ikin-y-cauri-cuenta-med.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-COLLAROR-01",
        "stock": 10,
        "price": 449
      }
    ],
    "all_categories": [
      "collares-de-orumila",
      "collares-y-pulseras",
      "lo-nuevo"
    ]
  },
  {
    "id": 101,
    "slug": "collar-orula-ikin-cristal-azul",
    "sku": "OJA-COLLAROR",
    "name": "Collar Orula Ikin y Cristal Azul",
    "description": "♦ Elaborado con cuentas de Otutu Opon Grande, Ikin y Cuenta de Cristal Azul que combinan el vibrante color verde y el cafe. (Orula) • Medida: 35 cm de largo",
    "base_price": 387.07,
    "price_with_tax": 449,
    "effective_price": 449,
    "stock": 10,
    "category_name": "Collares de Orumila",
    "category": {
      "id": 7,
      "name": "Collares de Orumila",
      "slug": "collares-de-orumila",
      "product_count": 18
    },
    "is_featured": false,
    "rating_avg": 0,
    "review_count": 0,
    "price": 449,
    "original_price": 800,
    "discount_pct": 43.9,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/collar-orula-ikin-y-cristal-azul.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/collar-orula-ikin-y-cristal-azul.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-COLLAROR-01",
        "stock": 10,
        "price": 449
      }
    ],
    "all_categories": [
      "collares-de-orumila",
      "collares-y-pulseras",
      "lo-nuevo"
    ]
  },
  {
    "id": 102,
    "slug": "collar-orula-ikin-cauri-cristal-azul",
    "sku": "OJA-COLLAROR",
    "name": "Collar Orula Ikin, Cauri y Cristal Azul",
    "description": "♦ Elaborado con cuentas de Otutu Opon Grande, Ikin, Cauri y Cuenta de Cristal Azul que combinan el vibrante color verde y el cafe. (Orula) • Medida: 35 cm de largo",
    "base_price": 387.07,
    "price_with_tax": 449,
    "effective_price": 449,
    "stock": 10,
    "category_name": "Collares de Orumila",
    "category": {
      "id": 7,
      "name": "Collares de Orumila",
      "slug": "collares-de-orumila",
      "product_count": 18
    },
    "is_featured": false,
    "rating_avg": 0,
    "review_count": 0,
    "price": 449,
    "original_price": 800,
    "discount_pct": 43.9,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/collar-orula-ikin-cauri-y-cristal-azul.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/collar-orula-ikin-cauri-y-cristal-azul.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-COLLAROR-01",
        "stock": 10,
        "price": 449
      }
    ],
    "all_categories": [
      "collares-de-orumila",
      "collares-y-pulseras",
      "lo-nuevo"
    ]
  },
  {
    "id": 103,
    "slug": "collar-orumila-chica",
    "sku": "OJA-COLLAROR",
    "name": "Collar Orula Otutu Opon Cuenta Chica",
    "description": "♦ Elaborado con cuentas de Otutu Opon de tamaño chica que combinan el vibrante color verde y el cafe. (Orula) • Medida: 40 cm de largo",
    "base_price": 343.97,
    "price_with_tax": 399,
    "effective_price": 399,
    "stock": 10,
    "category_name": "Collares de Orumila",
    "category": {
      "id": 7,
      "name": "Collares de Orumila",
      "slug": "collares-de-orumila",
      "product_count": 18
    },
    "is_featured": false,
    "rating_avg": 0,
    "review_count": 0,
    "price": 399,
    "original_price": 499,
    "discount_pct": 20,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/collar-orula-otutu-opon-cuenta-chica.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/collar-orula-otutu-opon-cuenta-chica.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-COLLAROR-01",
        "stock": 10,
        "price": 399
      }
    ],
    "all_categories": [
      "collares-de-orumila",
      "collares-y-pulseras",
      "lo-nuevo"
    ]
  },
  {
    "id": 104,
    "slug": "collar-orumila-otutu-opon-grande",
    "sku": "OJA-COLLAROR",
    "name": "Collar Orula Otutu Opon Cuenta Grande",
    "description": "♦ Elaborado con cuentas de Otutu Opon de tamaño Grande que combinan el vibrante color verde y el cafe. (Orula) • Medida: 40 cm de largo",
    "base_price": 343.97,
    "price_with_tax": 399,
    "effective_price": 399,
    "stock": 10,
    "category_name": "Collares de Orumila",
    "category": {
      "id": 7,
      "name": "Collares de Orumila",
      "slug": "collares-de-orumila",
      "product_count": 18
    },
    "is_featured": false,
    "rating_avg": 0,
    "review_count": 0,
    "price": 399,
    "original_price": 499,
    "discount_pct": 20,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/collar-orula-otutu-opon-cuenta-grande.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/collar-orula-otutu-opon-cuenta-grande.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-COLLAROR-01",
        "stock": 10,
        "price": 399
      }
    ],
    "all_categories": [
      "collares-de-orumila",
      "collares-y-pulseras",
      "lo-nuevo"
    ]
  },
  {
    "id": 105,
    "slug": "collar-orumila-otutu-opon-jumbo",
    "sku": "OJA-COLLAROR",
    "name": "Collar Orula Otutu Opon Cuenta Jumbo",
    "description": "♦ Elaborado con cuentas de Otutu Opon de tamaño Jumbo que combinan el vibrante color verde y el cafe. (Orula) • Medida: 40 cm de largo",
    "base_price": 516.38,
    "price_with_tax": 599,
    "effective_price": 599,
    "stock": 10,
    "category_name": "Collares de Orumila",
    "category": {
      "id": 7,
      "name": "Collares de Orumila",
      "slug": "collares-de-orumila",
      "product_count": 18
    },
    "is_featured": false,
    "rating_avg": 0,
    "review_count": 0,
    "price": 599,
    "original_price": 800,
    "discount_pct": 25.1,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/collar-orula-otutu-opon-cuenta-jumbo.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/collar-orula-otutu-opon-cuenta-jumbo.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-COLLAROR-01",
        "stock": 10,
        "price": 599
      }
    ],
    "all_categories": [
      "collares-de-orumila",
      "collares-y-pulseras",
      "lo-nuevo"
    ]
  },
  {
    "id": 106,
    "slug": "collar-orumila-mediana",
    "sku": "OJA-COLLAROR",
    "name": "Collar Orula Otutu Opon Cuenta Mediana",
    "description": "♦ Elaborado con cuentas de Otutu Opon de tamaño mediana que combinan el vibrante color verde y el cafe. • Medida: 40 cm de largo",
    "base_price": 343.97,
    "price_with_tax": 399,
    "effective_price": 399,
    "stock": 10,
    "category_name": "Collares de Orumila",
    "category": {
      "id": 7,
      "name": "Collares de Orumila",
      "slug": "collares-de-orumila",
      "product_count": 18
    },
    "is_featured": false,
    "rating_avg": 0,
    "review_count": 0,
    "price": 399,
    "original_price": 499,
    "discount_pct": 20,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/collar-orula-otutu-opon-cuenta-mediana.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/collar-orula-otutu-opon-cuenta-mediana.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-COLLAROR-01",
        "stock": 10,
        "price": 399
      }
    ],
    "all_categories": [
      "collares-de-orumila",
      "collares-y-pulseras",
      "lo-nuevo"
    ]
  },
  {
    "id": 107,
    "slug": "collar-osun",
    "sku": "OJA-COLLAROS",
    "name": "Collar Osun Cuenta Grande",
    "description": "♦ Ilekes de Orisa de cuenta Grande | • 37 Cm de Largo",
    "base_price": 300.86,
    "price_with_tax": 349,
    "effective_price": 349,
    "stock": 10,
    "category_name": "Collares y Pulseras",
    "category": {
      "id": 3,
      "name": "Collares y Pulseras",
      "slug": "collares-y-pulseras",
      "product_count": 69
    },
    "is_featured": false,
    "rating_avg": 5,
    "review_count": 0,
    "price": 349,
    "original_price": 500,
    "discount_pct": 30.2,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/collar-osun-cuenta-grande.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/collar-osun-cuenta-grande.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-COLLAROS-01",
        "stock": 10,
        "price": 349
      }
    ],
    "all_categories": [
      "collares-y-pulseras"
    ]
  },
  {
    "id": 108,
    "slug": "collar-sango",
    "sku": "OJA-COLLARSA",
    "name": "Collar Sango Cuenta Grande",
    "description": "♦ Ilekes de Orisa de cuenta Grande | • 37 Cm de Largo",
    "base_price": 300.86,
    "price_with_tax": 349,
    "effective_price": 349,
    "stock": 10,
    "category_name": "Collares y Pulseras",
    "category": {
      "id": 3,
      "name": "Collares y Pulseras",
      "slug": "collares-y-pulseras",
      "product_count": 69
    },
    "is_featured": false,
    "rating_avg": 0,
    "review_count": 0,
    "price": 349,
    "original_price": 500,
    "discount_pct": 30.2,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/collar-sango-cuenta-grande.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/collar-sango-cuenta-grande.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-COLLARSA-01",
        "stock": 10,
        "price": 349
      }
    ],
    "all_categories": [
      "collares-y-pulseras"
    ]
  },
  {
    "id": 109,
    "slug": "collar-yemoja",
    "sku": "OJA-COLLARYE",
    "name": "Collar Yemoja Cuenta Grande",
    "description": "♦ Ilekes de Orisa de cuenta Grande | • 37 Cm de Largo",
    "base_price": 300.86,
    "price_with_tax": 349,
    "effective_price": 349,
    "stock": 10,
    "category_name": "Collares y Pulseras",
    "category": {
      "id": 3,
      "name": "Collares y Pulseras",
      "slug": "collares-y-pulseras",
      "product_count": 69
    },
    "is_featured": false,
    "rating_avg": 0,
    "review_count": 0,
    "price": 349,
    "original_price": 500,
    "discount_pct": 30.2,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/collar-yemoja-cuenta-grande.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/collar-yemoja-cuenta-grande.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-COLLARYE-01",
        "stock": 10,
        "price": 349
      }
    ],
    "all_categories": [
      "collares-y-pulseras"
    ]
  },
  {
    "id": 110,
    "slug": "dije-elefante",
    "sku": "OJA-DIJEELEF",
    "name": "Dije Elefante / con Collar",
    "description": "♦ Dije de Elefante de Bronce | • Dije con collar de cuenta grande.",
    "base_price": 645.69,
    "price_with_tax": 749,
    "effective_price": 749,
    "stock": 10,
    "category_name": "Collares y Pulseras",
    "category": {
      "id": 3,
      "name": "Collares y Pulseras",
      "slug": "collares-y-pulseras",
      "product_count": 69
    },
    "is_featured": false,
    "rating_avg": 0,
    "review_count": 0,
    "price": 749,
    "original_price": 949,
    "discount_pct": 21.1,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/dije-elefante-con-collar.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/dije-elefante-con-collar.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-DIJEELEF-01",
        "stock": 10,
        "price": 749
      }
    ],
    "all_categories": [
      "collares-y-pulseras"
    ]
  },
  {
    "id": 111,
    "slug": "esu-bronce",
    "sku": "OJA-ESUBRONC",
    "name": "Dije Esu Alaje Bronce / con Collar",
    "description": "♦ Dije de Esu Alaje de Bronce | • Dije con collar de cuenta grande, “color del collar según disposición” (Azul o Blanco)",
    "base_price": 645.69,
    "price_with_tax": 749,
    "effective_price": 749,
    "stock": 10,
    "category_name": "Collares y Pulseras",
    "category": {
      "id": 3,
      "name": "Collares y Pulseras",
      "slug": "collares-y-pulseras",
      "product_count": 69
    },
    "is_featured": false,
    "rating_avg": 5,
    "review_count": 10,
    "price": 749,
    "original_price": 949,
    "discount_pct": 21.1,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/dije-esu-alaje-bronce-con-collar.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/dije-esu-alaje-bronce-con-collar.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-ESUBRONC-01",
        "stock": 10,
        "price": 749
      }
    ],
    "all_categories": [
      "collares-y-pulseras"
    ]
  },
  {
    "id": 112,
    "slug": "dije-esu-odara-bronce-con-collar",
    "sku": "OJA-DIJEESUO",
    "name": "Dije Esu Odara Bronce / con Collar",
    "description": "♦ Dije de Esu Odara de Bronce con Yangi | • Medidas: Dije 7 cm – Collar 37 cm largo • Dije con collar de cuenta grande, (Rojo y Negro)",
    "base_price": 1292.24,
    "price_with_tax": 1499,
    "effective_price": 1499,
    "stock": 10,
    "category_name": "Collares y Pulseras",
    "category": {
      "id": 3,
      "name": "Collares y Pulseras",
      "slug": "collares-y-pulseras",
      "product_count": 69
    },
    "is_featured": false,
    "rating_avg": 0,
    "review_count": 0,
    "price": 1499,
    "original_price": 2000,
    "discount_pct": 25,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/dije-esu-odara-bronce-con-collar.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/dije-esu-odara-bronce-con-collar.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-DIJEESUO-01",
        "stock": 10,
        "price": 1499
      }
    ],
    "all_categories": [
      "collares-y-pulseras",
      "lo-nuevo"
    ]
  },
  {
    "id": 113,
    "slug": "dije-rostro-orula-bronce-alargado",
    "sku": "OJA-DIJEROST",
    "name": "Dije Rostro Alargado Orula Bronce / con Collar",
    "description": "♦ Rostro de Orumila hecho de Bronce con collar de cuenta Otutu Opon",
    "base_price": 516.38,
    "price_with_tax": 599,
    "effective_price": 599,
    "stock": 10,
    "category_name": "Collares de Orumila",
    "category": {
      "id": 7,
      "name": "Collares de Orumila",
      "slug": "collares-de-orumila",
      "product_count": 18
    },
    "is_featured": false,
    "rating_avg": 0,
    "review_count": 0,
    "price": 599,
    "original_price": 650,
    "discount_pct": 7.8,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/dije-rostro-alargado-orula-bronce-con-collar.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/dije-rostro-alargado-orula-bronce-con-collar.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-DIJEROST-01",
        "stock": 10,
        "price": 599
      }
    ],
    "all_categories": [
      "collares-de-orumila",
      "collares-y-pulseras",
      "lo-nuevo"
    ]
  },
  {
    "id": 114,
    "slug": "dije-orula-mediano",
    "sku": "OJA-DIJEORUL",
    "name": "Dije Rostro Orula / con Collar",
    "description": "♦ Dije con rostro de Orumila de bronce | • Dije con collar de cuenta grande.",
    "base_price": 645.69,
    "price_with_tax": 749,
    "effective_price": 749,
    "stock": 10,
    "category_name": "Collares y Pulseras",
    "category": {
      "id": 3,
      "name": "Collares y Pulseras",
      "slug": "collares-y-pulseras",
      "product_count": 69
    },
    "is_featured": false,
    "rating_avg": 0,
    "review_count": 0,
    "price": 749,
    "original_price": 949,
    "discount_pct": 21.1,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/dije-rostro-orula-con-collar.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/dije-rostro-orula-con-collar.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-DIJEORUL-01",
        "stock": 10,
        "price": 749
      }
    ],
    "all_categories": [
      "collares-y-pulseras"
    ]
  },
  {
    "id": 115,
    "slug": "rostro-orumila",
    "sku": "OJA-ROSTROOR",
    "name": "Dije Rostro Orula Bronce / con Collar",
    "description": "♦ Rostro de Orumila hecho de Bronce con collar de cuenta Otutu Opon",
    "base_price": 516.38,
    "price_with_tax": 599,
    "effective_price": 599,
    "stock": 10,
    "category_name": "Collares de Orumila",
    "category": {
      "id": 7,
      "name": "Collares de Orumila",
      "slug": "collares-de-orumila",
      "product_count": 18
    },
    "is_featured": false,
    "rating_avg": 5,
    "review_count": 9,
    "price": 599,
    "original_price": 650,
    "discount_pct": 7.8,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/dije-rostro-orula-bronce-con-collar.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/dije-rostro-orula-bronce-con-collar.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-ROSTROOR-01",
        "stock": 10,
        "price": 599
      }
    ],
    "all_categories": [
      "collares-de-orumila",
      "collares-y-pulseras"
    ]
  },
  {
    "id": 116,
    "slug": "sango-bronce",
    "sku": "OJA-SANGOBRO",
    "name": "Dije Sango Bronce / con Collar",
    "description": "♦ Dije de Sango de Bronce | • Dije con collar de cuenta grande.",
    "base_price": 645.69,
    "price_with_tax": 749,
    "effective_price": 749,
    "stock": 10,
    "category_name": "Collares y Pulseras",
    "category": {
      "id": 3,
      "name": "Collares y Pulseras",
      "slug": "collares-y-pulseras",
      "product_count": 69
    },
    "is_featured": false,
    "rating_avg": 5,
    "review_count": 5,
    "price": 749,
    "original_price": 949,
    "discount_pct": 21.1,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/dije-sango-bronce-con-collar.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/dije-sango-bronce-con-collar.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-SANGOBRO-01",
        "stock": 10,
        "price": 749
      }
    ],
    "all_categories": [
      "collares-y-pulseras"
    ]
  },
  {
    "id": 117,
    "slug": "tablero-bronce",
    "sku": "OJA-TABLEROB",
    "name": "Dije Tablero Bronce / con Collar",
    "description": "♦ Tablero Dije de Bronce. | ⇒ 4 Cm de diámetro, Con collar de cuenta Tutu Opon Grande. | • Es un collar que presenta un dije de bronce en forma de tablero, con un profundo significado en la religión Yoruba. • El dije de tablero de bronce lleva símbolos y patrones sagrados relacionados con Ifa y las tradiciones espirituales Yorubas. • Este accesorio es más que una pieza de joyería; • Este collar es una forma de mostrar devoción y respeto hacia las creencias y prácticas ancestrales de esta religión.",
    "base_price": 645.69,
    "price_with_tax": 749,
    "effective_price": 749,
    "stock": 10,
    "category_name": "Collares de Orumila",
    "category": {
      "id": 7,
      "name": "Collares de Orumila",
      "slug": "collares-de-orumila",
      "product_count": 18
    },
    "is_featured": false,
    "rating_avg": 4.8,
    "review_count": 5,
    "price": 749,
    "original_price": null,
    "discount_pct": null,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/dije-tablero-bronce-con-collar.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/dije-tablero-bronce-con-collar.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-TABLEROB-01",
        "stock": 10,
        "price": 749
      }
    ],
    "all_categories": [
      "collares-de-orumila",
      "collares-y-pulseras"
    ]
  },
  {
    "id": 118,
    "slug": "dije-tablero-chico-bronce",
    "sku": "OJA-DIJETABL",
    "name": "Dije Tablero Chico Bronce / con Collar cuenta Chica",
    "description": "♦ Tablero Chico Dije de Bronce. | ⇒ 2.5 Cm de diámetro, Con collar de cuenta Tutu Opon Chica. | • Es un collar que presenta un dije de bronce en forma de tablero, con un profundo significado en la religión Yoruba. • El dije de tablero de bronce lleva símbolos y patrones sagrados relacionados con Ifa y las tradiciones espirituales Yorubas. • Este accesorio es más que una pieza de joyería; • Este collar es una forma de mostrar devoción y respeto hacia las creencias y prácticas ancestrales de esta religión.",
    "base_price": 473.28,
    "price_with_tax": 549,
    "effective_price": 549,
    "stock": 10,
    "category_name": "Collares de Orumila",
    "category": {
      "id": 7,
      "name": "Collares de Orumila",
      "slug": "collares-de-orumila",
      "product_count": 18
    },
    "is_featured": false,
    "rating_avg": 0,
    "review_count": 0,
    "price": 549,
    "original_price": null,
    "discount_pct": null,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/dije-tablero-chico-bronce-con-collar-cuenta-chica.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/dije-tablero-chico-bronce-con-collar-cuenta-chica.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-DIJETABL-01",
        "stock": 10,
        "price": 549
      }
    ],
    "all_categories": [
      "collares-de-orumila",
      "collares-y-pulseras"
    ]
  },
  {
    "id": 119,
    "slug": "dije-tambor-bronce",
    "sku": "OJA-DIJETAMB",
    "name": "Dije Tambor Bronce / con Collar",
    "description": "♦ Tambor hecho de Bronce con collar de Sango",
    "base_price": 516.38,
    "price_with_tax": 599,
    "effective_price": 599,
    "stock": 10,
    "category_name": "Collares y Pulseras",
    "category": {
      "id": 3,
      "name": "Collares y Pulseras",
      "slug": "collares-y-pulseras",
      "product_count": 69
    },
    "is_featured": false,
    "rating_avg": 0,
    "review_count": 0,
    "price": 599,
    "original_price": 650,
    "discount_pct": 7.8,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/dije-tambor-bronce-con-collar.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/dije-tambor-bronce-con-collar.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-DIJETAMB-01",
        "stock": 10,
        "price": 599
      }
    ],
    "all_categories": [
      "collares-y-pulseras",
      "lo-nuevo"
    ]
  },
  {
    "id": 120,
    "slug": "edun-ara-piedra-de-rayo",
    "sku": "OJA-EDUNARAP",
    "name": "Edun Ara / Piedra de Rayo",
    "description": "♦ Piedra de Rayo Nigeriana • La piedra de rayo, conocida como “Edun Ara” en la religión Yoruba, es una piedra sagrada y poderosa en la práctica espiritual yoruba. • Se cree que esta piedra contiene la energía y el poder de los dioses yoruba. | • Tamaños Disponibles ⇓⇓⇓",
    "base_price": 300.86,
    "price_with_tax": 349,
    "effective_price": 349,
    "stock": 10,
    "category_name": "Complementos y Herramientas",
    "category": {
      "id": 5,
      "name": "Complementos y Herramientas",
      "slug": "complementos-y-herramientas",
      "product_count": 45
    },
    "is_featured": false,
    "rating_avg": 4.92,
    "review_count": 13,
    "price": 349,
    "original_price": null,
    "discount_pct": null,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/edun-ara-piedra-de-rayo.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/edun-ara-piedra-de-rayo.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-EDUNARAP-01",
        "stock": 10,
        "price": 349
      }
    ],
    "all_categories": [
      "complementos-y-herramientas",
      "isan-iconos"
    ]
  },
  {
    "id": 121,
    "slug": "efun-africano",
    "sku": "OJA-EFUNAFRI",
    "name": "Efun Africano",
    "description": "♦ Venta por pieza | • Efun, en la religión Yoruba, es un polvo blanco sagrado y altamente reverenciado que desempeña un papel esencial en diversas prácticas religiosas y ceremonias.",
    "base_price": 21.55,
    "price_with_tax": 25,
    "effective_price": 25,
    "stock": 10,
    "category_name": "Enseres",
    "category": {
      "id": 6,
      "name": "Enseres",
      "slug": "enseres",
      "product_count": 29
    },
    "is_featured": false,
    "rating_avg": 4.94,
    "review_count": 34,
    "price": 25,
    "original_price": null,
    "discount_pct": null,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/efun-africano.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/efun-africano.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-EFUNAFRI-01",
        "stock": 10,
        "price": 25
      }
    ],
    "all_categories": [
      "enseres"
    ]
  },
  {
    "id": 122,
    "slug": "egbe-eleko",
    "sku": "OJA-EGBEELEK",
    "name": "Egbe Eleko",
    "description": "♦ Medidas: ⇒ 30 Cm de largo ⇒ 20 Cm de diámetro | • Es una herramienta tradicional utilizada en las prácticas espirituales y religiosas de la cultura yoruba. • Se trata de un objeto ritual que desempeña un papel importante en las ceremonias yorubas, relacionado con el Orisa Egbe",
    "base_price": 1206.03,
    "price_with_tax": 1399,
    "effective_price": 1399,
    "stock": 10,
    "category_name": "Complementos y Herramientas",
    "category": {
      "id": 5,
      "name": "Complementos y Herramientas",
      "slug": "complementos-y-herramientas",
      "product_count": 45
    },
    "is_featured": false,
    "rating_avg": 5,
    "review_count": 3,
    "price": 1399,
    "original_price": null,
    "discount_pct": null,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/egbe-eleko.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/egbe-eleko.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-EGBEELEK-01",
        "stock": 10,
        "price": 1399
      }
    ],
    "all_categories": [
      "complementos-y-herramientas",
      "isan-iconos"
    ]
  },
  {
    "id": 123,
    "slug": "egungun",
    "sku": "OJA-EGUNGUN",
    "name": "Egungun / Icono de los Ancestros",
    "description": "♦ Isan de Egungun (Ancestros) | ⇒ Atori de 35 a 40 Cm de Largo. | • El “Isan Egungun” es una poderosa pieza artesanal de 40 cm elaborada con palos de atori. • Diseñada para fomentar la conexión espiritual con los ancestros, esta representación única encarna la rica tradición de Egungun. • Cada palo cuidadosamente colocado simboliza un enlace con la historia ancestral, convirtiendo esta obra en un portal significativo.",
    "base_price": 1292.24,
    "price_with_tax": 1499,
    "effective_price": 1499,
    "stock": 10,
    "category_name": "Isan / Iconos",
    "category": {
      "id": 4,
      "name": "Isan / Iconos",
      "slug": "isan-iconos",
      "product_count": 67
    },
    "is_featured": false,
    "rating_avg": 5,
    "review_count": 7,
    "price": 1499,
    "original_price": null,
    "discount_pct": null,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/egungun-icono-de-los-ancestros.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/egungun-icono-de-los-ancestros.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-EGUNGUN-01",
        "stock": 10,
        "price": 1499
      }
    ],
    "all_categories": [
      "isan-iconos"
    ]
  },
  {
    "id": 124,
    "slug": "egungun-inuigo-riqueza",
    "sku": "OJA-EGUNGUNI",
    "name": "Egungun Inuigo / para Riqueza",
    "description": "♦ Botella para atraer la Riqueza. | USO: Se llena con ginebra y se va tomando un poco diario.",
    "base_price": 1293.1,
    "price_with_tax": 1500,
    "effective_price": 1500,
    "stock": 10,
    "category_name": "Akoses / Medicinas",
    "category": {
      "id": 2,
      "name": "Akoses / Medicinas",
      "slug": "akoses-medicinas",
      "product_count": 74
    },
    "is_featured": false,
    "rating_avg": 0,
    "review_count": 0,
    "price": 1500,
    "original_price": null,
    "discount_pct": null,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/egungun-inuigo-para-riqueza.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/egungun-inuigo-para-riqueza.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-EGUNGUNI-01",
        "stock": 10,
        "price": 1500
      }
    ],
    "all_categories": [
      "akoses-medicinas",
      "lo-nuevo"
    ]
  },
  {
    "id": 125,
    "slug": "egungun-inuigo-proteccion",
    "sku": "OJA-EGUNGUNI",
    "name": "Egungun Inuigo / Prosperidad y Protección",
    "description": "♦ Botella con medicina para recibir Protección y Prosperidad. | • Agboran (Muñeco) Dentro (el diseño del muñeco puede variar según el lote recibido) | • USO: Se llena con ginebra y se va tomando un poco diario.",
    "base_price": 2585.34,
    "price_with_tax": 2999,
    "effective_price": 2999,
    "stock": 10,
    "category_name": "Akoses / Medicinas",
    "category": {
      "id": 2,
      "name": "Akoses / Medicinas",
      "slug": "akoses-medicinas",
      "product_count": 74
    },
    "is_featured": false,
    "rating_avg": 5,
    "review_count": 0,
    "price": 2999,
    "original_price": 3999,
    "discount_pct": 25,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/egungun-inuigo-prosperidad-y-protección.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/egungun-inuigo-prosperidad-y-protección.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-EGUNGUNI-01",
        "stock": 10,
        "price": 2999
      }
    ],
    "all_categories": [
      "akoses-medicinas",
      "isan-iconos",
      "lo-nuevo"
    ]
  },
  {
    "id": 126,
    "slug": "egungun-inuigo-vencimiento",
    "sku": "OJA-EGUNGUNI",
    "name": "Egungun Inuigo / Vencimiento de Enemigos",
    "description": "Botella con medicina para Vencimiento de Enemigos. | Akose dentro de la Botella | USO: Se llena con ginebra y se va tomando un poco diario.",
    "base_price": 2155.17,
    "price_with_tax": 2500,
    "effective_price": 2500,
    "stock": 10,
    "category_name": "Akoses / Medicinas",
    "category": {
      "id": 2,
      "name": "Akoses / Medicinas",
      "slug": "akoses-medicinas",
      "product_count": 74
    },
    "is_featured": false,
    "rating_avg": 5,
    "review_count": 5,
    "price": 2500,
    "original_price": null,
    "discount_pct": null,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/egungun-inuigo-vencimiento-de-enemigos.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/egungun-inuigo-vencimiento-de-enemigos.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-EGUNGUNI-01",
        "stock": 10,
        "price": 2500
      }
    ],
    "all_categories": [
      "akoses-medicinas"
    ]
  },
  {
    "id": 127,
    "slug": "eja-aro",
    "sku": "OJA-EJAARO",
    "name": "Eja Aro / Pez Africano",
    "description": "♦ EJA ARO / PEZ GATO AFRICANO | ⇒ Tamaños: Chico, Mediano y Grande | • El “Eja Aro” es un tipo de pescado utilizado en la religión Yoruba con fines ceremoniales y espirituales. • En la tradición Yoruba, este pescado es considerado un elemento sagrado y se utiliza como alimento y en diversos rituales y ofrendas para honrar a los Orisas y establecer una conexión con el mundo espiritual. | Aprovecha Descuento por Volumen",
    "base_price": 103.45,
    "price_with_tax": 120,
    "effective_price": 120,
    "stock": 10,
    "category_name": "Enseres",
    "category": {
      "id": 6,
      "name": "Enseres",
      "slug": "enseres",
      "product_count": 29
    },
    "is_featured": false,
    "rating_avg": 4.83,
    "review_count": 36,
    "price": 120,
    "original_price": null,
    "discount_pct": null,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/eja-aro-pez-africano.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/eja-aro-pez-africano.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-EJAARO-01",
        "stock": 10,
        "price": 120
      }
    ],
    "all_categories": [
      "enseres",
      "mayoreo"
    ]
  },
  {
    "id": 128,
    "slug": "eku-ifa",
    "sku": "OJA-EKUIFA",
    "name": "Eku Ifa Nigeriana",
    "description": "♦ Eku Ifa de 15 Cm de Cuerpo Aprox. Rata Africana Chica | NOTA: Secada de forma natural, sin ningún Químico dañino al organismo. | 👇 Aprovecha Descuento por Volumen 👇",
    "base_price": 257.76,
    "price_with_tax": 299,
    "effective_price": 299,
    "stock": 10,
    "category_name": "Enseres",
    "category": {
      "id": 6,
      "name": "Enseres",
      "slug": "enseres",
      "product_count": 29
    },
    "is_featured": false,
    "rating_avg": 4.89,
    "review_count": 38,
    "price": 299,
    "original_price": null,
    "discount_pct": null,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/eku-ifa-nigeriana.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/eku-ifa-nigeriana.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-EKUIFA-01",
        "stock": 10,
        "price": 299
      }
    ],
    "all_categories": [
      "enseres",
      "mayoreo"
    ]
  },
  {
    "id": 129,
    "slug": "eku-ijebu",
    "sku": "OJA-EKUIJEBU",
    "name": "Eku Ijebu",
    "description": "• Eku Ijebu es una semilla que posee significado en la religión Yoruba. • Se considera un elemento ritual y simbólico utilizado en prácticas ceremoniales.",
    "base_price": 214.66,
    "price_with_tax": 249,
    "effective_price": 249,
    "stock": 10,
    "category_name": "Enseres",
    "category": {
      "id": 6,
      "name": "Enseres",
      "slug": "enseres",
      "product_count": 29
    },
    "is_featured": false,
    "rating_avg": 5,
    "review_count": 2,
    "price": 249,
    "original_price": 350,
    "discount_pct": 28.9,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/eku-ijebu.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/eku-ijebu.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-EKUIJEBU-01",
        "stock": 10,
        "price": 249
      }
    ],
    "all_categories": [
      "enseres",
      "semillas"
    ]
  },
  {
    "id": 130,
    "slug": "emu-vino-de-palma-600-ml",
    "sku": "OJA-EMUVINOD",
    "name": "Emu / Vino de Palma 600 Ml",
    "description": "♦ Botella de 600 Ml | • El Emu, también conocido como Vino de Palma, es una bebida tradicional africana elaborada a partir de la savia fermentada de la palmera. • Es una parte importante de la cultura y las celebraciones locales, así como de la religión Yoruba.",
    "base_price": 473.28,
    "price_with_tax": 549,
    "effective_price": 549,
    "stock": 10,
    "category_name": "Enseres",
    "category": {
      "id": 6,
      "name": "Enseres",
      "slug": "enseres",
      "product_count": 29
    },
    "is_featured": false,
    "rating_avg": 5,
    "review_count": 0,
    "price": 549,
    "original_price": null,
    "discount_pct": null,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/emu-vino-de-palma-600-ml.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/emu-vino-de-palma-600-ml.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-EMUVINOD-01",
        "stock": 10,
        "price": 549
      }
    ],
    "all_categories": [
      "enseres",
      "lo-nuevo"
    ]
  },
  {
    "id": 131,
    "slug": "eru",
    "sku": "OJA-ERU",
    "name": "Eru – 1/4 Libra",
    "description": "♦ Vainas de Eru | • Bolsa de 1/4 de Libra | Nota: Si desea media libra seleccionar 2 piezas y así sucesivamente.",
    "base_price": 280.17,
    "price_with_tax": 325,
    "effective_price": 325,
    "stock": 10,
    "category_name": "Enseres",
    "category": {
      "id": 6,
      "name": "Enseres",
      "slug": "enseres",
      "product_count": 29
    },
    "is_featured": false,
    "rating_avg": 5,
    "review_count": 11,
    "price": 325,
    "original_price": null,
    "discount_pct": null,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/eru-–-1-4-libra.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/eru-–-1-4-libra.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-ERU-01",
        "stock": 10,
        "price": 325
      }
    ],
    "all_categories": [
      "enseres",
      "semillas"
    ]
  },
  {
    "id": 132,
    "slug": "estera-africana",
    "sku": "OJA-ESTERAAF",
    "name": "Estera Africana",
    "description": "♦ Medidas: → 180 x 120 Cm. (Reforzada) → 200 x 120 Cm. → 240 x 150 Cm. | Nota: Selecciona las medidas y después las opciones disponibles en los recuadros de abajo. De esa forma te mostrara la foto y costo de la estera seleccionada. | • Modelos Disponibles ⇓⇓⇓",
    "base_price": 818.1,
    "price_with_tax": 949,
    "effective_price": 949,
    "stock": 10,
    "category_name": "Complementos y Herramientas",
    "category": {
      "id": 5,
      "name": "Complementos y Herramientas",
      "slug": "complementos-y-herramientas",
      "product_count": 45
    },
    "is_featured": false,
    "rating_avg": 5,
    "review_count": 3,
    "price": 949,
    "original_price": null,
    "discount_pct": null,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/estera-africana.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/estera-africana.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-ESTERAAF-01",
        "stock": 10,
        "price": 949
      }
    ],
    "all_categories": [
      "complementos-y-herramientas",
      "varios"
    ]
  },
  {
    "id": 133,
    "slug": "esu-alaje-10-cm",
    "sku": "OJA-ESUALAJE",
    "name": "Esu Alaje / 10 Cm.",
    "description": "♦ Medidas: → 10 Cm de altura | ⇒ Esu para la Riqueza | • En la religión Yoruba los agboran son muñecos esculpidos en madera. • Son objetos sagrados utilizados en rituales y ceremonias para representar y honrar a las deidades.",
    "base_price": 1033.62,
    "price_with_tax": 1199,
    "effective_price": 1199,
    "stock": 10,
    "category_name": "Isan / Iconos",
    "category": {
      "id": 4,
      "name": "Isan / Iconos",
      "slug": "isan-iconos",
      "product_count": 67
    },
    "is_featured": false,
    "rating_avg": 0,
    "review_count": 0,
    "price": 1199,
    "original_price": null,
    "discount_pct": null,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/esu-alaje-10-cm.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/esu-alaje-10-cm.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-ESUALAJE-01",
        "stock": 10,
        "price": 1199
      }
    ],
    "all_categories": [
      "isan-iconos",
      "lo-nuevo"
    ]
  },
  {
    "id": 134,
    "slug": "esu-alaje-25cm",
    "sku": "OJA-ESUALAJE",
    "name": "Esu Alaje / 25 Cm.",
    "description": "♦ Medidas: → 25 Cm de altura | ⇒ Esu para la Riqueza | • En la religión Yoruba los agboran son muñecos esculpidos en madera. • Son objetos sagrados utilizados en rituales y ceremonias para representar y honrar a las deidades.",
    "base_price": 2154.31,
    "price_with_tax": 2499,
    "effective_price": 2499,
    "stock": 10,
    "category_name": "Isan / Iconos",
    "category": {
      "id": 4,
      "name": "Isan / Iconos",
      "slug": "isan-iconos",
      "product_count": 67
    },
    "is_featured": false,
    "rating_avg": 5,
    "review_count": 9,
    "price": 2499,
    "original_price": null,
    "discount_pct": null,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/esu-alaje-25-cm.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/esu-alaje-25-cm.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-ESUALAJE-01",
        "stock": 10,
        "price": 2499
      }
    ],
    "all_categories": [
      "isan-iconos"
    ]
  },
  {
    "id": 135,
    "slug": "alaje-cabeza-larga",
    "sku": "OJA-ALAJECAB",
    "name": "Esu Alaje / Cabeza Larga",
    "description": "♦ Medidas: → 30 Cm de altura | ⇒ Esu para la Riqueza | • En la religión Yoruba los agboran son muñecos esculpidos en madera. • Son objetos sagrados utilizados en rituales y ceremonias para representar y honrar a las deidades.",
    "base_price": 2240.52,
    "price_with_tax": 2599,
    "effective_price": 2599,
    "stock": 10,
    "category_name": "Isan / Iconos",
    "category": {
      "id": 4,
      "name": "Isan / Iconos",
      "slug": "isan-iconos",
      "product_count": 67
    },
    "is_featured": false,
    "rating_avg": 5,
    "review_count": 4,
    "price": 2599,
    "original_price": null,
    "discount_pct": null,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/esu-alaje-cabeza-larga.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/esu-alaje-cabeza-larga.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-ALAJECAB-01",
        "stock": 10,
        "price": 2599
      }
    ],
    "all_categories": [
      "isan-iconos"
    ]
  },
  {
    "id": 136,
    "slug": "esu-alaje-dos",
    "sku": "OJA-ESUALAJE",
    "name": "Esu Alaje / Cauri en Cabeza",
    "description": "♦ Medidas: → 38 Cm de altura | ⇒ Esu para la Riqueza | • En la religión Yoruba los agboran son muñecos esculpidos en madera. • Son objetos sagrados utilizados en rituales y ceremonias para representar y honrar a las deidades.",
    "base_price": 2326.72,
    "price_with_tax": 2699,
    "effective_price": 2699,
    "stock": 10,
    "category_name": "Isan / Iconos",
    "category": {
      "id": 4,
      "name": "Isan / Iconos",
      "slug": "isan-iconos",
      "product_count": 67
    },
    "is_featured": false,
    "rating_avg": 5,
    "review_count": 7,
    "price": 2699,
    "original_price": null,
    "discount_pct": null,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/esu-alaje-cauri-en-cabeza.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/esu-alaje-cauri-en-cabeza.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-ESUALAJE-01",
        "stock": 10,
        "price": 2699
      }
    ],
    "all_categories": [
      "isan-iconos"
    ]
  },
  {
    "id": 137,
    "slug": "esu-alaje",
    "sku": "OJA-ESUALAJE",
    "name": "Esu Alaje / Esu de la Riqueza",
    "description": "♦ Esu para la Riqueza •30 Cm de altura | • En la religión Yoruba los Agboran son objetos sagrados utilizados en rituales y ceremonias para representar y honrar a las deidades.",
    "base_price": 2068.1,
    "price_with_tax": 2399,
    "effective_price": 2399,
    "stock": 10,
    "category_name": "Isan / Iconos",
    "category": {
      "id": 4,
      "name": "Isan / Iconos",
      "slug": "isan-iconos",
      "product_count": 67
    },
    "is_featured": false,
    "rating_avg": 4.88,
    "review_count": 8,
    "price": 2399,
    "original_price": null,
    "discount_pct": null,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/esu-alaje-esu-de-la-riqueza.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/esu-alaje-esu-de-la-riqueza.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-ESUALAJE-01",
        "stock": 10,
        "price": 2399
      }
    ],
    "all_categories": [
      "isan-iconos"
    ]
  },
  {
    "id": 138,
    "slug": "esu-ase",
    "sku": "OJA-ESUASE",
    "name": "Esu Ase / Manifiesta lo que uno Anhela",
    "description": "♦ Esu Ase • Ayuda a atraer la prosperidad y manifestar lo que uno busca en la vida.",
    "base_price": 5602.59,
    "price_with_tax": 6499,
    "effective_price": 6499,
    "stock": 10,
    "category_name": "Isan / Iconos",
    "category": {
      "id": 4,
      "name": "Isan / Iconos",
      "slug": "isan-iconos",
      "product_count": 67
    },
    "is_featured": false,
    "rating_avg": 5,
    "review_count": 0,
    "price": 6499,
    "original_price": null,
    "discount_pct": null,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/esu-ase-manifiesta-lo-que-uno-anhela.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/esu-ase-manifiesta-lo-que-uno-anhela.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-ESUASE-01",
        "stock": 10,
        "price": 6499
      }
    ],
    "all_categories": [
      "isan-iconos",
      "lo-nuevo"
    ]
  },
  {
    "id": 139,
    "slug": "esu-iseri-gangan-exito-financiero",
    "sku": "OJA-ESUISERI",
    "name": "Esu Iseri Gangan / Exito Financiero",
    "description": "♦ Esu Iseri Gangan, ayuda a atraer la prosperidad, el éxito financiero y la estabilidad en general",
    "base_price": 4740.52,
    "price_with_tax": 5499,
    "effective_price": 5499,
    "stock": 10,
    "category_name": "Isan / Iconos",
    "category": {
      "id": 4,
      "name": "Isan / Iconos",
      "slug": "isan-iconos",
      "product_count": 67
    },
    "is_featured": false,
    "rating_avg": 0,
    "review_count": 0,
    "price": 5499,
    "original_price": null,
    "discount_pct": null,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/esu-iseri-gangan-exito-financiero.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/esu-iseri-gangan-exito-financiero.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-ESUISERI-01",
        "stock": 10,
        "price": 5499
      }
    ],
    "all_categories": [
      "isan-iconos",
      "lo-nuevo"
    ]
  },
  {
    "id": 140,
    "slug": "esu-odara-gorro",
    "sku": "OJA-ESUODARA",
    "name": "Esu Odara con Gorro",
    "description": "♦ Medidas: ⇒ 40 cm. de altura con Sombrero de Cuentas | • En la religión Yoruba sería una figura esculpida en madera o arcilla, representando a Esu Odara. • Este muñeco podría variar en tamaño, pero típicamente sería una representación estilizada de un hombre. • Su rostro puede ser expresivo y a menudo se le representa sosteniendo una vara o un objeto similar, en ocaciones decorado con cuentas o gorros. • Simboliza su papel como mensajero y mediador en la religión Yoruba",
    "base_price": 2499.14,
    "price_with_tax": 2899,
    "effective_price": 2899,
    "stock": 10,
    "category_name": "Isan / Iconos",
    "category": {
      "id": 4,
      "name": "Isan / Iconos",
      "slug": "isan-iconos",
      "product_count": 67
    },
    "is_featured": false,
    "rating_avg": 5,
    "review_count": 3,
    "price": 2899,
    "original_price": null,
    "discount_pct": null,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/esu-odara-con-gorro.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/esu-odara-con-gorro.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-ESUODARA-01",
        "stock": 10,
        "price": 2899
      }
    ],
    "all_categories": [
      "isan-iconos"
    ]
  },
  {
    "id": 141,
    "slug": "esu-odara-grande",
    "sku": "OJA-ESUODARA",
    "name": "Esu Odara Grande",
    "description": "♦ Medidas: ⇒ 55 cm. de altura ⇒ 31 cm. de ancho | • En la religión Yoruba sería una figura esculpida en madera o arcilla, representando a Esu Odara. • Este muñeco podría variar en tamaño, pero típicamente sería una representación estilizada de un hombre. • Su rostro puede ser expresivo y a menudo se le representa sosteniendo una vara o un objeto similar, en ocaciones decorado con cuentas o gorros. • Simboliza su papel como mensajero y mediador en la religión Yoruba",
    "base_price": 4050.86,
    "price_with_tax": 4699,
    "effective_price": 4699,
    "stock": 10,
    "category_name": "Isan / Iconos",
    "category": {
      "id": 4,
      "name": "Isan / Iconos",
      "slug": "isan-iconos",
      "product_count": 67
    },
    "is_featured": false,
    "rating_avg": 5,
    "review_count": 0,
    "price": 4699,
    "original_price": null,
    "discount_pct": null,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/esu-odara-grande.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/esu-odara-grande.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-ESUODARA-01",
        "stock": 10,
        "price": 4699
      }
    ],
    "all_categories": [
      "isan-iconos"
    ]
  },
  {
    "id": 142,
    "slug": "esu-odara-mediano",
    "sku": "OJA-ESUODARA",
    "name": "Esu Odara Mediano",
    "description": "♦ Medidas: ⇒ 40 cm. de altura ⇒ 31 cm. de ancho | • En la religión Yoruba sería una figura esculpida en madera o arcilla, representando a Esu Odara. • Este muñeco podría variar en tamaño, pero típicamente sería una representación estilizada de un hombre. • Su rostro puede ser expresivo y a menudo se le representa sosteniendo una vara o un objeto similar, en ocaciones decorado con cuentas o gorros. • Simboliza su papel como mensajero y mediador en la religión Yoruba",
    "base_price": 3275,
    "price_with_tax": 3799,
    "effective_price": 3799,
    "stock": 10,
    "category_name": "Isan / Iconos",
    "category": {
      "id": 4,
      "name": "Isan / Iconos",
      "slug": "isan-iconos",
      "product_count": 67
    },
    "is_featured": false,
    "rating_avg": 5,
    "review_count": 0,
    "price": 3799,
    "original_price": null,
    "discount_pct": null,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/esu-odara-mediano.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/esu-odara-mediano.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-ESUODARA-01",
        "stock": 10,
        "price": 3799
      }
    ],
    "all_categories": [
      "isan-iconos"
    ]
  },
  {
    "id": 143,
    "slug": "esu-odara-sencillo",
    "sku": "OJA-ESUODARA",
    "name": "Esu Odara Sencillo",
    "description": "♦ Medidas: ⇒ 42 cm. de altura ⇒ 20 cm. de ancho | • En la religión Yoruba sería una figura esculpida en madera o arcilla, representando a Esu Odara. • Este muñeco podría variar en tamaño, pero típicamente sería una representación estilizada de un hombre. • Su rostro puede ser expresivo y a menudo se le representa sosteniendo una vara o un objeto similar, en ocasiones decorado con cuentas o gorros. • Simboliza su papel como mensajero y mediador en la religión Yoruba",
    "base_price": 2154.31,
    "price_with_tax": 2499,
    "effective_price": 2499,
    "stock": 10,
    "category_name": "Isan / Iconos",
    "category": {
      "id": 4,
      "name": "Isan / Iconos",
      "slug": "isan-iconos",
      "product_count": 67
    },
    "is_featured": false,
    "rating_avg": 0,
    "review_count": 0,
    "price": 2499,
    "original_price": null,
    "discount_pct": null,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/esu-odara-sencillo.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/esu-odara-sencillo.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-ESUODARA-01",
        "stock": 10,
        "price": 2499
      }
    ],
    "all_categories": [
      "isan-iconos",
      "lo-nuevo"
    ]
  },
  {
    "id": 144,
    "slug": "esu-sigidi",
    "sku": "OJA-ESUSIGID",
    "name": "Esu Sigidi",
    "description": "♦ Esu Sigidi de madera, mide de 30 a 35 Cm. de altura | • Esu para Defensa y Ataque",
    "base_price": 1723.28,
    "price_with_tax": 1999,
    "effective_price": 1999,
    "stock": 10,
    "category_name": "Isan / Iconos",
    "category": {
      "id": 4,
      "name": "Isan / Iconos",
      "slug": "isan-iconos",
      "product_count": 67
    },
    "is_featured": false,
    "rating_avg": 5,
    "review_count": 3,
    "price": 1999,
    "original_price": 2500,
    "discount_pct": 20,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/esu-sigidi.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/esu-sigidi.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-ESUSIGID-01",
        "stock": 10,
        "price": 1999
      }
    ],
    "all_categories": [
      "isan-iconos"
    ]
  },
  {
    "id": 145,
    "slug": "ewes-hierbas-africanas",
    "sku": "OJA-EWESHIER",
    "name": "Ewes / Hierbas Africanas",
    "description": "♦ Cantidad: En la Imagen se detallada la cantidad aproximada en Gramos de cada ewe. (Mas cantidad que en otras Tiendas) | • Ewes Disponibles ⇓⇓⇓",
    "base_price": 300.86,
    "price_with_tax": 349,
    "effective_price": 349,
    "stock": 10,
    "category_name": "Akoses / Medicinas",
    "category": {
      "id": 2,
      "name": "Akoses / Medicinas",
      "slug": "akoses-medicinas",
      "product_count": 74
    },
    "is_featured": false,
    "rating_avg": 5,
    "review_count": 3,
    "price": 349,
    "original_price": null,
    "discount_pct": null,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/ewes-hierbas-africanas.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/ewes-hierbas-africanas.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-EWESHIER-01",
        "stock": 10,
        "price": 349
      }
    ],
    "all_categories": [
      "akoses-medicinas",
      "enseres"
    ]
  },
  {
    "id": 146,
    "slug": "fila-africana",
    "sku": "OJA-FILAAFRI",
    "name": "Fila Africana",
    "description": "♦ Gorro Tradicional Africano • 55 a 60 Cm de Circunferencia | • Modelos Disponibles ⇓⇓⇓",
    "base_price": 645.69,
    "price_with_tax": 749,
    "effective_price": 749,
    "stock": 10,
    "category_name": "Ropa y Telas",
    "category": {
      "id": 10,
      "name": "Ropa y Telas",
      "slug": "ropa-y-telas",
      "product_count": 8
    },
    "is_featured": false,
    "rating_avg": 0,
    "review_count": 0,
    "price": 749,
    "original_price": null,
    "discount_pct": null,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/fila-africana.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/fila-africana.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-FILAAFRI-01",
        "stock": 10,
        "price": 749
      }
    ],
    "all_categories": [
      "ropa-y-telas"
    ]
  },
  {
    "id": 147,
    "slug": "gargantilla-de-iyun-con-coral",
    "sku": "OJA-GARGANTI",
    "name": "Gargantilla de Iyun con Coral",
    "description": "Gargantilla de Iyun Azul con Coral | 45 cm de largo",
    "base_price": 645.69,
    "price_with_tax": 749,
    "effective_price": 749,
    "stock": 10,
    "category_name": "Collares y Pulseras",
    "category": {
      "id": 3,
      "name": "Collares y Pulseras",
      "slug": "collares-y-pulseras",
      "product_count": 69
    },
    "is_featured": false,
    "rating_avg": 5,
    "review_count": 0,
    "price": 749,
    "original_price": null,
    "discount_pct": null,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/gargantilla-de-iyun-con-coral.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/gargantilla-de-iyun-con-coral.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-GARGANTI-01",
        "stock": 10,
        "price": 749
      }
    ],
    "all_categories": [
      "collares-y-pulseras"
    ]
  },
  {
    "id": 148,
    "slug": "gbetu-gbetu",
    "sku": "OJA-GBETUGBE",
    "name": "Gbetu Gbetu / Manifestar lo que se Desea",
    "description": "♦ Gbetu Gbetu es una Akose para manifestar pronto lo que se desea. • Gbetu Gbetu lo manifestara incluso de inmediato si es posible. | • Mide entre 10 a 15 Centímetros.",
    "base_price": 1293.1,
    "price_with_tax": 1500,
    "effective_price": 1500,
    "stock": 10,
    "category_name": "Akoses / Medicinas",
    "category": {
      "id": 2,
      "name": "Akoses / Medicinas",
      "slug": "akoses-medicinas",
      "product_count": 74
    },
    "is_featured": false,
    "rating_avg": 4.95,
    "review_count": 20,
    "price": 1500,
    "original_price": null,
    "discount_pct": null,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/gbetu-gbetu-manifestar-lo-que-se-desea.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/gbetu-gbetu-manifestar-lo-que-se-desea.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-GBETUGBE-01",
        "stock": 10,
        "price": 1500
      }
    ],
    "all_categories": [
      "akoses-medicinas"
    ]
  },
  {
    "id": 149,
    "slug": "gele-gorro-mujer",
    "sku": "OJA-GELEGORR",
    "name": "Gele / Gorro Mujer",
    "description": "♦ El Gele es un accesorio tradicional para la cabeza, originario de África Occidental (usado por las mujeres Yoruba de Nigeria), que se utiliza como un accesorio de moda elegante y un símbolo de estatus cultural. | • Modelos Disponibles ⇓⇓⇓",
    "base_price": 128.45,
    "price_with_tax": 149,
    "effective_price": 149,
    "stock": 10,
    "category_name": "Complementos y Herramientas",
    "category": {
      "id": 5,
      "name": "Complementos y Herramientas",
      "slug": "complementos-y-herramientas",
      "product_count": 45
    },
    "is_featured": false,
    "rating_avg": 0,
    "review_count": 0,
    "price": 149,
    "original_price": null,
    "discount_pct": null,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/gele-gorro-mujer.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/gele-gorro-mujer.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-GELEGORR-01",
        "stock": 10,
        "price": 149
      }
    ],
    "all_categories": [
      "complementos-y-herramientas",
      "lo-nuevo",
      "ropa-y-telas"
    ]
  },
  {
    "id": 150,
    "slug": "gele-premium-gorro-mujer",
    "sku": "OJA-GELEPREM",
    "name": "Gele Premium / Gorro Mujer",
    "description": "♦ El Gele es un accesorio tradicional para la cabeza, originario de África Occidental (usado por las mujeres Yoruba de Nigeria), que se utiliza como un accesorio de moda elegante y un símbolo de estatus cultural. | • Modelos Disponibles ⇓⇓⇓",
    "base_price": 430.17,
    "price_with_tax": 499,
    "effective_price": 499,
    "stock": 10,
    "category_name": "Complementos y Herramientas",
    "category": {
      "id": 5,
      "name": "Complementos y Herramientas",
      "slug": "complementos-y-herramientas",
      "product_count": 45
    },
    "is_featured": false,
    "rating_avg": 0,
    "review_count": 0,
    "price": 499,
    "original_price": null,
    "discount_pct": null,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/gele-premium-gorro-mujer.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/gele-premium-gorro-mujer.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-GELEPREM-01",
        "stock": 10,
        "price": 499
      }
    ],
    "all_categories": [
      "complementos-y-herramientas",
      "lo-nuevo",
      "ropa-y-telas"
    ]
  },
  {
    "id": 151,
    "slug": "ide-con-coral",
    "sku": "OJA-IDECONCO",
    "name": "Ide con Coral",
    "description": "♦ Ide de Orumila cuenta grande con Coral",
    "base_price": 172.41,
    "price_with_tax": 200,
    "effective_price": 200,
    "stock": 10,
    "category_name": "Collares y Pulseras",
    "category": {
      "id": 3,
      "name": "Collares y Pulseras",
      "slug": "collares-y-pulseras",
      "product_count": 69
    },
    "is_featured": false,
    "rating_avg": 5,
    "review_count": 10,
    "price": 200,
    "original_price": 350,
    "discount_pct": 42.9,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/ide-con-coral.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/ide-con-coral.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-IDECONCO-01",
        "stock": 10,
        "price": 200
      }
    ],
    "all_categories": [
      "collares-y-pulseras"
    ]
  },
  {
    "id": 152,
    "slug": "ide-egbe",
    "sku": "OJA-IDEEGBE",
    "name": "Ide Egbe",
    "description": "♦ Ide de Egbe cuenta grande | • Cinta elastica",
    "base_price": 215.52,
    "price_with_tax": 250,
    "effective_price": 250,
    "stock": 10,
    "category_name": "Collares y Pulseras",
    "category": {
      "id": 3,
      "name": "Collares y Pulseras",
      "slug": "collares-y-pulseras",
      "product_count": 69
    },
    "is_featured": false,
    "rating_avg": 5,
    "review_count": 10,
    "price": 250,
    "original_price": 400,
    "discount_pct": 37.5,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/ide-egbe.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/ide-egbe.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-IDEEGBE-01",
        "stock": 10,
        "price": 250
      }
    ],
    "all_categories": [
      "collares-y-pulseras"
    ]
  },
  {
    "id": 153,
    "slug": "igba-orisas",
    "sku": "OJA-IGBAORIS",
    "name": "Igba Orisas",
    "description": "♦ Recipiente para Orisa ⇒ 15 a 20 Cm de Diámetro Aprox. | • El recipiente de Orisa es una pieza artesanal hecha de igba, una calabaza seleccionada cuidadosamente. • Su exterior está exquisitamente decorado con cuentas o caracoles, añadiendo un toque de belleza y colorido. | • Modelos Disponibles ⇓⇓⇓",
    "base_price": 2154.31,
    "price_with_tax": 2499,
    "effective_price": 2499,
    "stock": 10,
    "category_name": "Isan / Iconos",
    "category": {
      "id": 4,
      "name": "Isan / Iconos",
      "slug": "isan-iconos",
      "product_count": 67
    },
    "is_featured": false,
    "rating_avg": 5,
    "review_count": 0,
    "price": 2499,
    "original_price": null,
    "discount_pct": null,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/igba-orisas.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/igba-orisas.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-IGBAORIS-01",
        "stock": 10,
        "price": 2499
      }
    ],
    "all_categories": [
      "isan-iconos"
    ]
  },
  {
    "id": 154,
    "slug": "ikines-de-4-ojos",
    "sku": "OJA-IKINESDE",
    "name": "Ikines de 4 Ojos",
    "description": "♦ Con 21 piezas. | • Los ikines de 4 ojos son semillas de palma sagrada utilizadas en la religión Yoruba con una profunda significancia espiritual. • Estas semillas son esenciales en rituales y ceremonias religiosas, donde representan la conexión con lo divino y la sabiduría ancestral. • Además de su valor religioso, también son consideradas con poder espiritual en la cultura Yoruba.",
    "base_price": 300.86,
    "price_with_tax": 349,
    "effective_price": 349,
    "stock": 10,
    "category_name": "Isan / Iconos",
    "category": {
      "id": 4,
      "name": "Isan / Iconos",
      "slug": "isan-iconos",
      "product_count": 67
    },
    "is_featured": false,
    "rating_avg": 4.92,
    "review_count": 49,
    "price": 349,
    "original_price": 450,
    "discount_pct": 22.4,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/ikines-de-4-ojos.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/ikines-de-4-ojos.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-IKINESDE-01",
        "stock": 10,
        "price": 349
      }
    ],
    "all_categories": [
      "isan-iconos",
      "semillas"
    ]
  },
  {
    "id": 155,
    "slug": "ikines-5-ojos",
    "sku": "OJA-IKINES5O",
    "name": "Ikines de 5 Ojos",
    "description": "♦ Con 21 piezas. | • Los ikines de 5 ojos son semillas de palma sagrada utilizadas en la religión Yoruba con una profunda significancia espiritual. • Estas semillas son esenciales en rituales y ceremonias religiosas, donde representan la conexión con lo divino y la sabiduría ancestral. • Además de su valor religioso, también son consideradas con poder espiritual en la cultura Yoruba.",
    "base_price": 387.93,
    "price_with_tax": 450,
    "effective_price": 450,
    "stock": 10,
    "category_name": "Isan / Iconos",
    "category": {
      "id": 4,
      "name": "Isan / Iconos",
      "slug": "isan-iconos",
      "product_count": 67
    },
    "is_featured": false,
    "rating_avg": 5,
    "review_count": 3,
    "price": 450,
    "original_price": 600,
    "discount_pct": 25,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/ikines-de-5-ojos.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/ikines-de-5-ojos.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-IKINES5O-01",
        "stock": 10,
        "price": 450
      }
    ],
    "all_categories": [
      "isan-iconos",
      "semillas"
    ]
  },
  {
    "id": 156,
    "slug": "ikobere-aabo",
    "sku": "OJA-IKOBEREA",
    "name": "Ikobere Aabo / Protección con Iyami Osooronga",
    "description": "♦ Ikobere Aabo, ayuda a tener la protección e inmunidad a través de Iyami Osooronga y verse beneficiado por las Iyami. • Medidas 5×8 cm y el collar mide 40 cm doblado | • USO: Se usa colgado como collar o en el bolsillo o bolso de uso diario.",
    "base_price": 602.59,
    "price_with_tax": 699,
    "effective_price": 699,
    "stock": 10,
    "category_name": "Akoses / Medicinas",
    "category": {
      "id": 2,
      "name": "Akoses / Medicinas",
      "slug": "akoses-medicinas",
      "product_count": 74
    },
    "is_featured": false,
    "rating_avg": 5,
    "review_count": 7,
    "price": 699,
    "original_price": 1500,
    "discount_pct": 53.4,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/ikobere-aabo-protección-con-iyami-osooronga.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/ikobere-aabo-protección-con-iyami-osooronga.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-IKOBEREA-01",
        "stock": 10,
        "price": 699
      }
    ],
    "all_categories": [
      "akoses-medicinas",
      "ikoberes-amuletos",
      "lo-nuevo"
    ]
  },
  {
    "id": 157,
    "slug": "ataques-espirituales",
    "sku": "OJA-ATAQUESE",
    "name": "Ikobere Awọn ifun ti ẹmi / Ataques Espirituales y Energeticos",
    "description": "♦ Ikobere para evitar Ataques Espirituales y Energéticos | USO: Se porta diario en el cuello o en un bolso o bolsa de uso diario.",
    "base_price": 516.38,
    "price_with_tax": 599,
    "effective_price": 599,
    "stock": 10,
    "category_name": "Akoses / Medicinas",
    "category": {
      "id": 2,
      "name": "Akoses / Medicinas",
      "slug": "akoses-medicinas",
      "product_count": 74
    },
    "is_featured": false,
    "rating_avg": 5,
    "review_count": 5,
    "price": 599,
    "original_price": 900,
    "discount_pct": 33.4,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/ikobere-awọn-ifun-ti-ẹmi-ataques-espirituales-y-energeticos.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/ikobere-awọn-ifun-ti-ẹmi-ataques-espirituales-y-energeticos.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-ATAQUESE-01",
        "stock": 10,
        "price": 599
      }
    ],
    "all_categories": [
      "akoses-medicinas",
      "ikoberes-amuletos"
    ]
  },
  {
    "id": 158,
    "slug": "ikobere-para-atraer-bendiciones",
    "sku": "OJA-IKOBEREP",
    "name": "Ikobere Blanco / Atraer Bendiciones",
    "description": "Ikobere Blanco para Obtener Bendiciones | NOTA: Cuenta con sujetador para Collar o se puede usar en el Bolsillo o Bolso.",
    "base_price": 688.79,
    "price_with_tax": 799,
    "effective_price": 799,
    "stock": 10,
    "category_name": "Akoses / Medicinas",
    "category": {
      "id": 2,
      "name": "Akoses / Medicinas",
      "slug": "akoses-medicinas",
      "product_count": 74
    },
    "is_featured": false,
    "rating_avg": 5,
    "review_count": 3,
    "price": 799,
    "original_price": 1100,
    "discount_pct": 27.4,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/ikobere-blanco-atraer-bendiciones.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/ikobere-blanco-atraer-bendiciones.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-IKOBEREP-01",
        "stock": 10,
        "price": 799
      }
    ],
    "all_categories": [
      "akoses-medicinas",
      "ikoberes-amuletos"
    ]
  },
  {
    "id": 159,
    "slug": "ikobere-itanja-proteccion-y-devolver-danos",
    "sku": "OJA-IKOBEREI",
    "name": "Ikobere Itanja / Protección y Devolver Daños",
    "description": "♦ Ikobere para proteger de daños Espirituales y Físicos y devolver el daño. | • Indicaciones de Uso se Envían con la Compra",
    "base_price": 1292.24,
    "price_with_tax": 1499,
    "effective_price": 1499,
    "stock": 10,
    "category_name": "Akoses / Medicinas",
    "category": {
      "id": 2,
      "name": "Akoses / Medicinas",
      "slug": "akoses-medicinas",
      "product_count": 74
    },
    "is_featured": false,
    "rating_avg": 4.8,
    "review_count": 5,
    "price": 1499,
    "original_price": null,
    "discount_pct": null,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/ikobere-itanja-protección-y-devolver-daños.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/ikobere-itanja-protección-y-devolver-daños.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-IKOBEREI-01",
        "stock": 10,
        "price": 1499
      }
    ],
    "all_categories": [
      "akoses-medicinas",
      "ikoberes-amuletos",
      "lo-nuevo"
    ]
  },
  {
    "id": 160,
    "slug": "ikobere-dominio",
    "sku": "OJA-IKOBERED",
    "name": "Ikobere Negro / Dominio y Control",
    "description": "Ikobere Negro para Obtener Dominio y Control sobre personas o determinadas circunstancias | NOTA: Cuenta con sujetador para Collar o se puede usar en el Bolsillo o Bolso.",
    "base_price": 688.79,
    "price_with_tax": 799,
    "effective_price": 799,
    "stock": 10,
    "category_name": "Akoses / Medicinas",
    "category": {
      "id": 2,
      "name": "Akoses / Medicinas",
      "slug": "akoses-medicinas",
      "product_count": 74
    },
    "is_featured": false,
    "rating_avg": 5,
    "review_count": 2,
    "price": 799,
    "original_price": 1100,
    "discount_pct": 27.4,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/ikobere-negro-dominio-y-control.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/ikobere-negro-dominio-y-control.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-IKOBERED-01",
        "stock": 10,
        "price": 799
      }
    ],
    "all_categories": [
      "akoses-medicinas",
      "ikoberes-amuletos"
    ]
  },
  {
    "id": 161,
    "slug": "ikobere-antibalas",
    "sku": "OJA-IKOBEREA",
    "name": "Ikobere Ohun Ija / Antibalas",
    "description": "♦ Ikobere para evitar afectaciones por armas | NOTA: No funciona para actividades Ilicitas",
    "base_price": 3016.38,
    "price_with_tax": 3499,
    "effective_price": 3499,
    "stock": 10,
    "category_name": "Akoses / Medicinas",
    "category": {
      "id": 2,
      "name": "Akoses / Medicinas",
      "slug": "akoses-medicinas",
      "product_count": 74
    },
    "is_featured": false,
    "rating_avg": 0,
    "review_count": 0,
    "price": 3499,
    "original_price": 4500,
    "discount_pct": 22.2,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/ikobere-ohun-ija-antibalas.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/ikobere-ohun-ija-antibalas.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-IKOBEREA-01",
        "stock": 10,
        "price": 3499
      }
    ],
    "all_categories": [
      "akoses-medicinas",
      "ikoberes-amuletos",
      "lo-nuevo"
    ]
  },
  {
    "id": 162,
    "slug": "ikobere-okiki",
    "sku": "OJA-IKOBEREO",
    "name": "Ikobere Okiki / Fama y Prestigio",
    "description": "♦ Ikobere Okiki, ayuda a tener Fama y Prestigio en lo que la persona haga, ya sea temas personales o laborales. • Medidas 5×8 cm y el collar mide 40 cm doblado | • USO: Se usa colgado como collar o en el bolsillo o bolso de uso diario.",
    "base_price": 602.59,
    "price_with_tax": 699,
    "effective_price": 699,
    "stock": 10,
    "category_name": "Akoses / Medicinas",
    "category": {
      "id": 2,
      "name": "Akoses / Medicinas",
      "slug": "akoses-medicinas",
      "product_count": 74
    },
    "is_featured": false,
    "rating_avg": 5,
    "review_count": 7,
    "price": 699,
    "original_price": 1500,
    "discount_pct": 53.4,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/ikobere-okiki-fama-y-prestigio.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/ikobere-okiki-fama-y-prestigio.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-IKOBEREO-01",
        "stock": 10,
        "price": 699
      }
    ],
    "all_categories": [
      "akoses-medicinas",
      "ikoberes-amuletos",
      "lo-nuevo"
    ]
  },
  {
    "id": 163,
    "slug": "ikobere-oko-ayokole",
    "sku": "OJA-IKOBEREO",
    "name": "Ikobere Oko Ayokole / Protección al Automóvil",
    "description": "♦ Amuleto para protección de los carros | • Se coloca en el retrovisor o en la guantera y siempre se trae dentro del automóvil.",
    "base_price": 431.03,
    "price_with_tax": 500,
    "effective_price": 500,
    "stock": 10,
    "category_name": "Akoses / Medicinas",
    "category": {
      "id": 2,
      "name": "Akoses / Medicinas",
      "slug": "akoses-medicinas",
      "product_count": 74
    },
    "is_featured": false,
    "rating_avg": 5,
    "review_count": 28,
    "price": 500,
    "original_price": null,
    "discount_pct": null,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/ikobere-oko-ayokole-protección-al-automóvil.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/ikobere-oko-ayokole-protección-al-automóvil.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-IKOBEREO-01",
        "stock": 10,
        "price": 500
      }
    ],
    "all_categories": [
      "akoses-medicinas",
      "ikoberes-amuletos"
    ]
  },
  {
    "id": 164,
    "slug": "ikobere-oro",
    "sku": "OJA-IKOBEREO",
    "name": "Ikobere Oro / Riqueza y Dinero Abundante",
    "description": "• Amuleto para atraer Riqueza y Dinero en abundancia. | • USO: Se usa colgado como collar o en el bolsillo o bolso de uso diario.",
    "base_price": 602.59,
    "price_with_tax": 699,
    "effective_price": 699,
    "stock": 10,
    "category_name": "Akoses / Medicinas",
    "category": {
      "id": 2,
      "name": "Akoses / Medicinas",
      "slug": "akoses-medicinas",
      "product_count": 74
    },
    "is_featured": false,
    "rating_avg": 5,
    "review_count": 8,
    "price": 699,
    "original_price": 1000,
    "discount_pct": 30.1,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/ikobere-oro-riqueza-y-dinero-abundante.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/ikobere-oro-riqueza-y-dinero-abundante.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-IKOBEREO-01",
        "stock": 10,
        "price": 699
      }
    ],
    "all_categories": [
      "akoses-medicinas",
      "ikoberes-amuletos"
    ]
  },
  {
    "id": 165,
    "slug": "ikobere-atraer-amor",
    "sku": "OJA-IKOBEREA",
    "name": "Ikobere para Atraer el Amor",
    "description": "♦ Ayuda a atraer a la persona ideal. | • USO: Se usa colgado como collar o en el bolsillo o bolso de uso diario. Se agita 3 veces sobre la cabeza, diario en las mañanas",
    "base_price": 861.21,
    "price_with_tax": 999,
    "effective_price": 999,
    "stock": 10,
    "category_name": "Akoses / Medicinas",
    "category": {
      "id": 2,
      "name": "Akoses / Medicinas",
      "slug": "akoses-medicinas",
      "product_count": 74
    },
    "is_featured": false,
    "rating_avg": 0,
    "review_count": 0,
    "price": 999,
    "original_price": 1500,
    "discount_pct": 33.4,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/ikobere-para-atraer-el-amor.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/ikobere-para-atraer-el-amor.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-IKOBEREA-01",
        "stock": 10,
        "price": 999
      }
    ],
    "all_categories": [
      "akoses-medicinas",
      "ikoberes-amuletos",
      "lo-nuevo"
    ]
  },
  {
    "id": 166,
    "slug": "ikobere-buena-suerte",
    "sku": "OJA-IKOBEREB",
    "name": "Ikobere para Buena Suerte",
    "description": "♦ Ayuda a atraer la buena suerte. | • USO: Se usa colgado como collar o en el bolsillo o bolso de uso diario. Se agita 3 veces sobre la cabeza, diario en las mañanas",
    "base_price": 861.21,
    "price_with_tax": 999,
    "effective_price": 999,
    "stock": 10,
    "category_name": "Akoses / Medicinas",
    "category": {
      "id": 2,
      "name": "Akoses / Medicinas",
      "slug": "akoses-medicinas",
      "product_count": 74
    },
    "is_featured": false,
    "rating_avg": 5,
    "review_count": 0,
    "price": 999,
    "original_price": 1500,
    "discount_pct": 33.4,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/ikobere-para-buena-suerte.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/ikobere-para-buena-suerte.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-IKOBEREB-01",
        "stock": 10,
        "price": 999
      }
    ],
    "all_categories": [
      "akoses-medicinas",
      "ikoberes-amuletos",
      "lo-nuevo"
    ]
  },
  {
    "id": 167,
    "slug": "ikobere-evitar-accidentes",
    "sku": "OJA-IKOBEREE",
    "name": "Ikobere para Evitar Accidentes",
    "description": "♦ Ayuda a evitar accidentes. | • USO: Se usa colgado como collar o en el bolsillo o bolso de uso diario. Se agita 3 veces sobre la cabeza, diario en las mañanas",
    "base_price": 861.21,
    "price_with_tax": 999,
    "effective_price": 999,
    "stock": 10,
    "category_name": "Akoses / Medicinas",
    "category": {
      "id": 2,
      "name": "Akoses / Medicinas",
      "slug": "akoses-medicinas",
      "product_count": 74
    },
    "is_featured": false,
    "rating_avg": 5,
    "review_count": 0,
    "price": 999,
    "original_price": 1500,
    "discount_pct": 33.4,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/ikobere-para-evitar-accidentes.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/ikobere-para-evitar-accidentes.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-IKOBEREE-01",
        "stock": 10,
        "price": 999
      }
    ],
    "all_categories": [
      "akoses-medicinas",
      "ikoberes-amuletos",
      "lo-nuevo"
    ]
  },
  {
    "id": 168,
    "slug": "ikobere-pedir-favores",
    "sku": "OJA-IKOBEREP",
    "name": "Ikobere para Pedir Favores",
    "description": "♦ Ayuda a obtener favores de las personas. | • USO: Se usa colgado como collar o en el bolsillo o bolso de uso diario. Se agita 3 veces sobre la cabeza, diario en las mañanas",
    "base_price": 861.21,
    "price_with_tax": 999,
    "effective_price": 999,
    "stock": 10,
    "category_name": "Akoses / Medicinas",
    "category": {
      "id": 2,
      "name": "Akoses / Medicinas",
      "slug": "akoses-medicinas",
      "product_count": 74
    },
    "is_featured": false,
    "rating_avg": 0,
    "review_count": 0,
    "price": 999,
    "original_price": 1500,
    "discount_pct": 33.4,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/ikobere-para-pedir-favores.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/ikobere-para-pedir-favores.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-IKOBEREP-01",
        "stock": 10,
        "price": 999
      }
    ],
    "all_categories": [
      "akoses-medicinas",
      "ikoberes-amuletos",
      "lo-nuevo"
    ]
  },
  {
    "id": 169,
    "slug": "ikobere-proteccion",
    "sku": "OJA-IKOBEREP",
    "name": "Ikobere Rojo / Protección",
    "description": "Ikobere Rojo para Protección de enviaciones negativas | NOTA: Se puede usar en el Bolsillo o Bolso. No tiene ojal para colgarse",
    "base_price": 688.79,
    "price_with_tax": 799,
    "effective_price": 799,
    "stock": 10,
    "category_name": "Akoses / Medicinas",
    "category": {
      "id": 2,
      "name": "Akoses / Medicinas",
      "slug": "akoses-medicinas",
      "product_count": 74
    },
    "is_featured": false,
    "rating_avg": 5,
    "review_count": 3,
    "price": 799,
    "original_price": 1100,
    "discount_pct": 27.4,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/ikobere-rojo-protección.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/ikobere-rojo-protección.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-IKOBEREP-01",
        "stock": 10,
        "price": 799
      }
    ],
    "all_categories": [
      "akoses-medicinas",
      "ikoberes-amuletos"
    ]
  },
  {
    "id": 170,
    "slug": "ile-ori",
    "sku": "OJA-ILEORI",
    "name": "Ile Ori con Igbori",
    "description": "♦ Ile Ori, Incluye Igbori • 30 Cm de altura | • Modelos Disponibles ⇓⇓⇓",
    "base_price": 3749.14,
    "price_with_tax": 4349,
    "effective_price": 4349,
    "stock": 10,
    "category_name": "Isan / Iconos",
    "category": {
      "id": 4,
      "name": "Isan / Iconos",
      "slug": "isan-iconos",
      "product_count": 67
    },
    "is_featured": false,
    "rating_avg": 5,
    "review_count": 2,
    "price": 4349,
    "original_price": 5000,
    "discount_pct": 13,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/ile-ori-con-igbori.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/ile-ori-con-igbori.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-ILEORI-01",
        "stock": 10,
        "price": 4349
      }
    ],
    "all_categories": [
      "isan-iconos"
    ]
  },
  {
    "id": 171,
    "slug": "ipara-iferan-crema-para-atraccion",
    "sku": "OJA-IPARAIFE",
    "name": "Ipara Iferan / Crema para Atracción",
    "description": "♦ Para atracción del sexo opuesto. • Crema de uso en el rostro",
    "base_price": 431.03,
    "price_with_tax": 500,
    "effective_price": 500,
    "stock": 10,
    "category_name": "Akoses / Medicinas",
    "category": {
      "id": 2,
      "name": "Akoses / Medicinas",
      "slug": "akoses-medicinas",
      "product_count": 74
    },
    "is_featured": false,
    "rating_avg": 5,
    "review_count": 20,
    "price": 500,
    "original_price": 1000,
    "discount_pct": 50,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/ipara-iferan-crema-para-atracción.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/ipara-iferan-crema-para-atracción.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-IPARAIFE-01",
        "stock": 10,
        "price": 500
      }
    ],
    "all_categories": [
      "akoses-medicinas"
    ]
  },
  {
    "id": 172,
    "slug": "ipara-dominio",
    "sku": "OJA-IPARADOM",
    "name": "Ipara Iṣakoso / Dominio y Control",
    "description": "♦ Se aplica de forma sexual | ⇒ Cantidad 40 Grs, suficiente para muchas aplicaciones. | • Es una herramienta sorprendente que sumerge a los usuarios en el mundo de la espiritualidad Yoruba. • Diseñado para aquellos que buscan influir y tener un mayor control sobre ciertas personas. • Esta akose ofrece una amplia gama de recursos espirituales para dominio.",
    "base_price": 1550.86,
    "price_with_tax": 1799,
    "effective_price": 1799,
    "stock": 10,
    "category_name": "Akoses / Medicinas",
    "category": {
      "id": 2,
      "name": "Akoses / Medicinas",
      "slug": "akoses-medicinas",
      "product_count": 74
    },
    "is_featured": false,
    "rating_avg": 4.86,
    "review_count": 7,
    "price": 1799,
    "original_price": null,
    "discount_pct": null,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/ipara-iṣakoso-dominio-y-control.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/ipara-iṣakoso-dominio-y-control.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-IPARADOM-01",
        "stock": 10,
        "price": 1799
      }
    ],
    "all_categories": [
      "akoses-medicinas"
    ]
  },
  {
    "id": 173,
    "slug": "ipara-oja-crema-para-ventas",
    "sku": "OJA-IPARAOJA",
    "name": "Ipara Oja / Crema para ventas",
    "description": "♦ Crema para uso corporal para generar y atraer ventas. | • Frasco con 200 Grs. de crema con medicina.",
    "base_price": 603.45,
    "price_with_tax": 700,
    "effective_price": 700,
    "stock": 10,
    "category_name": "Akoses / Medicinas",
    "category": {
      "id": 2,
      "name": "Akoses / Medicinas",
      "slug": "akoses-medicinas",
      "product_count": 74
    },
    "is_featured": false,
    "rating_avg": 5,
    "review_count": 10,
    "price": 700,
    "original_price": null,
    "discount_pct": null,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/ipara-oja-crema-para-ventas.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/ipara-oja-crema-para-ventas.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-IPARAOJA-01",
        "stock": 10,
        "price": 700
      }
    ],
    "all_categories": [
      "akoses-medicinas"
    ]
  },
  {
    "id": 174,
    "slug": "ipara-wundia-crema-para-virilidad",
    "sku": "OJA-IPARAWUN",
    "name": "Ipara Wundia / Crema para la Virilidad",
    "description": "♦ Crema de uso corporal para fortalecer la virilidad.",
    "base_price": 1034.48,
    "price_with_tax": 1200,
    "effective_price": 1200,
    "stock": 10,
    "category_name": "Akoses / Medicinas",
    "category": {
      "id": 2,
      "name": "Akoses / Medicinas",
      "slug": "akoses-medicinas",
      "product_count": 74
    },
    "is_featured": false,
    "rating_avg": 5,
    "review_count": 3,
    "price": 1200,
    "original_price": 1500,
    "discount_pct": 20,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/ipara-wundia-crema-para-la-virilidad.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/ipara-wundia-crema-para-la-virilidad.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-IPARAWUN-01",
        "stock": 10,
        "price": 1200
      }
    ],
    "all_categories": [
      "akoses-medicinas"
    ]
  },
  {
    "id": 175,
    "slug": "iroke-africano",
    "sku": "OJA-IROKEAFR",
    "name": "Iroke Africano",
    "description": "♦ Iruke Africano ⇒ 29 a 34 Cms de Altura. | • Modelos Disponibles ⇓⇓⇓",
    "base_price": 1119.83,
    "price_with_tax": 1299,
    "effective_price": 1299,
    "stock": 10,
    "category_name": "Complementos y Herramientas",
    "category": {
      "id": 5,
      "name": "Complementos y Herramientas",
      "slug": "complementos-y-herramientas",
      "product_count": 45
    },
    "is_featured": false,
    "rating_avg": 4.8,
    "review_count": 5,
    "price": 1299,
    "original_price": 1500,
    "discount_pct": 13.4,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/iroke-africano.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/iroke-africano.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-IROKEAFR-01",
        "stock": 10,
        "price": 1299
      }
    ],
    "all_categories": [
      "complementos-y-herramientas",
      "isan-iconos"
    ]
  },
  {
    "id": 176,
    "slug": "iroke-de-cuentas",
    "sku": "OJA-IROKEDEC",
    "name": "Iroke de Cuentas",
    "description": "♦ Iroke de Orula o Blanco cubiertos de Cuentas • NOTA: No es Campana, y el diseño de las cuentas del de Orula se envía según el que este disponible. ⇒ Mide 25 Cm de Largo • Representa Jerarquía | • Modelos Disponibles ⇓⇓⇓",
    "base_price": 904.31,
    "price_with_tax": 1049,
    "effective_price": 1049,
    "stock": 10,
    "category_name": "Complementos y Herramientas",
    "category": {
      "id": 5,
      "name": "Complementos y Herramientas",
      "slug": "complementos-y-herramientas",
      "product_count": 45
    },
    "is_featured": false,
    "rating_avg": 0,
    "review_count": 0,
    "price": 1049,
    "original_price": 2000,
    "discount_pct": 47.6,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/iroke-de-cuentas.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/iroke-de-cuentas.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-IROKEDEC-01",
        "stock": 10,
        "price": 1049
      }
    ],
    "all_categories": [
      "complementos-y-herramientas",
      "lo-nuevo",
      "varios"
    ]
  },
  {
    "id": 177,
    "slug": "irukere",
    "sku": "OJA-IRUKERE",
    "name": "Irukere Africano / Cola de Vaca",
    "description": "♦ Con mango decorado con cuentas. | ⇒ 70 cm de largo Aprox. | • El irukere también puede tener un valor cultural y ceremonial en otras partes de África. • En algunas culturas, se utiliza en ocasiones especiales, eventos sociales y como parte de atuendos tradicionales.",
    "base_price": 1292.24,
    "price_with_tax": 1499,
    "effective_price": 1499,
    "stock": 10,
    "category_name": "Complementos y Herramientas",
    "category": {
      "id": 5,
      "name": "Complementos y Herramientas",
      "slug": "complementos-y-herramientas",
      "product_count": 45
    },
    "is_featured": false,
    "rating_avg": 5,
    "review_count": 13,
    "price": 1499,
    "original_price": null,
    "discount_pct": null,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/irukere-africano-cola-de-vaca.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/irukere-africano-cola-de-vaca.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-IRUKERE-01",
        "stock": 10,
        "price": 1499
      }
    ],
    "all_categories": [
      "complementos-y-herramientas"
    ]
  },
  {
    "id": 178,
    "slug": "irukere-africano",
    "sku": "OJA-IRUKEREA",
    "name": "Irukere Africano / Mango de Cuero",
    "description": "♦ Irukere Africano, Cola de Vaca • Mango de Cuero | ⇒ Medida: 50 a 60 Cms de Largo Aprox. → Color del pelo blanco | • El irukere también puede tener un valor cultural y ceremonial en otras partes de África. • En algunas culturas, se utiliza en ocasiones especiales, eventos sociales y como parte de atuendos tradicionales.",
    "base_price": 1033.62,
    "price_with_tax": 1199,
    "effective_price": 1199,
    "stock": 10,
    "category_name": "Isan / Iconos",
    "category": {
      "id": 4,
      "name": "Isan / Iconos",
      "slug": "isan-iconos",
      "product_count": 67
    },
    "is_featured": false,
    "rating_avg": 5,
    "review_count": 2,
    "price": 1199,
    "original_price": null,
    "discount_pct": null,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/irukere-africano-mango-de-cuero.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/irukere-africano-mango-de-cuero.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-IRUKEREA-01",
        "stock": 10,
        "price": 1199
      }
    ],
    "all_categories": [
      "isan-iconos",
      "lo-nuevo"
    ]
  },
  {
    "id": 179,
    "slug": "isan-egbe",
    "sku": "OJA-ISANEGBE",
    "name": "Isan Egbe",
    "description": "♦ Isan de Egbe de 30 cm de Largo | NOTA: no incluye plumas, las plumas se adquieren por separado",
    "base_price": 1292.24,
    "price_with_tax": 1499,
    "effective_price": 1499,
    "stock": 10,
    "category_name": "Isan / Iconos",
    "category": {
      "id": 4,
      "name": "Isan / Iconos",
      "slug": "isan-iconos",
      "product_count": 67
    },
    "is_featured": false,
    "rating_avg": 5,
    "review_count": 3,
    "price": 1499,
    "original_price": null,
    "discount_pct": null,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/isan-egbe.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/isan-egbe.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-ISANEGBE-01",
        "stock": 10,
        "price": 1499
      }
    ],
    "all_categories": [
      "isan-iconos"
    ]
  },
  {
    "id": 180,
    "slug": "ites-tapete-con-cuentas",
    "sku": "OJA-ITESTAPE",
    "name": "Ites / Tapete con Cuentas",
    "description": "♦ MEDIDAS: 50 X 30 Cm Aprox. | • Están hechos de cuentas, con diseños coloridos y se colocan en el suelo o en superficies planas durante Dafas (consultas) y rituales. • Modelos Disponibles ⇓⇓⇓",
    "base_price": 2585.34,
    "price_with_tax": 2999,
    "effective_price": 2999,
    "stock": 10,
    "category_name": "Complementos y Herramientas",
    "category": {
      "id": 5,
      "name": "Complementos y Herramientas",
      "slug": "complementos-y-herramientas",
      "product_count": 45
    },
    "is_featured": false,
    "rating_avg": 5,
    "review_count": 3,
    "price": 2999,
    "original_price": 3499,
    "discount_pct": 14.3,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/ites-tapete-con-cuentas.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/ites-tapete-con-cuentas.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-ITESTAPE-01",
        "stock": 10,
        "price": 2999
      }
    ],
    "all_categories": [
      "complementos-y-herramientas",
      "lo-nuevo",
      "ropa-y-telas"
    ]
  },
  {
    "id": 181,
    "slug": "ites",
    "sku": "OJA-ITES",
    "name": "Ites / Tapete y Bolso",
    "description": "♦ “Doblable” ⇒ Medida – 50 x 30 Cm | • Ideal para Dafas (consultas), transportar y guardar Opeles, Caracoles, Igbos Etc… Sobre el se acostumbra tirar el Opele o Caracol. | • Modelos Disponibles ⇓⇓⇓",
    "base_price": 387.07,
    "price_with_tax": 449,
    "effective_price": 449,
    "stock": 10,
    "category_name": "Complementos y Herramientas",
    "category": {
      "id": 5,
      "name": "Complementos y Herramientas",
      "slug": "complementos-y-herramientas",
      "product_count": 45
    },
    "is_featured": false,
    "rating_avg": 5,
    "review_count": 11,
    "price": 449,
    "original_price": null,
    "discount_pct": null,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/ites-tapete-y-bolso.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/ites-tapete-y-bolso.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-ITES-01",
        "stock": 10,
        "price": 449
      }
    ],
    "all_categories": [
      "complementos-y-herramientas",
      "lo-nuevo",
      "ropa-y-telas"
    ]
  },
  {
    "id": 182,
    "slug": "caracol-aje",
    "sku": "OJA-CARACOLA",
    "name": "Iya Aje / Caracol Aje",
    "description": "⇒ Caracol Africano. • Iya Aje es un caracol natural que tiene una representación simbólica en la religión Yoruba como un símbolo de la deidad Orisa Aje, quien es asociada con la riqueza y la prosperidad. | • Tamaños Disponibles ⇓⇓⇓",
    "base_price": 111.21,
    "price_with_tax": 129,
    "effective_price": 129,
    "stock": 10,
    "category_name": "Akoses / Medicinas",
    "category": {
      "id": 2,
      "name": "Akoses / Medicinas",
      "slug": "akoses-medicinas",
      "product_count": 74
    },
    "is_featured": false,
    "rating_avg": 4.95,
    "review_count": 22,
    "price": 129,
    "original_price": null,
    "discount_pct": null,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/iya-aje-caracol-aje.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/iya-aje-caracol-aje.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-CARACOLA-01",
        "stock": 10,
        "price": 129
      }
    ],
    "all_categories": [
      "akoses-medicinas",
      "isan-iconos",
      "varios"
    ]
  },
  {
    "id": 183,
    "slug": "iyan",
    "sku": "OJA-IYAN",
    "name": "Iyan / Ñame Molido",
    "description": "♦ Iyan / Ñame en Polvo, presentación de 1/2 Libra | Nota: Si deseas 1 Libra favor de seleccionar 2 piezas y así sucesivamente",
    "base_price": 215.52,
    "price_with_tax": 250,
    "effective_price": 250,
    "stock": 10,
    "category_name": "Enseres",
    "category": {
      "id": 6,
      "name": "Enseres",
      "slug": "enseres",
      "product_count": 29
    },
    "is_featured": false,
    "rating_avg": 5,
    "review_count": 10,
    "price": 250,
    "original_price": 400,
    "discount_pct": 37.5,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/iyan-ñame-molido.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/iyan-ñame-molido.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-IYAN-01",
        "stock": 10,
        "price": 250
      }
    ],
    "all_categories": [
      "enseres"
    ]
  },
  {
    "id": 184,
    "slug": "iyerosun",
    "sku": "OJA-IYEROSUN",
    "name": "Iyerosun",
    "description": "♦ Iyerosun, polvo sagrado original, presentación de 1/2 Libra | Nota: Si deseas 1 Libra favor de seleccionar 2 piezas y así sucesivamente",
    "base_price": 602.59,
    "price_with_tax": 699,
    "effective_price": 699,
    "stock": 10,
    "category_name": "Complementos y Herramientas",
    "category": {
      "id": 5,
      "name": "Complementos y Herramientas",
      "slug": "complementos-y-herramientas",
      "product_count": 45
    },
    "is_featured": false,
    "rating_avg": 4.96,
    "review_count": 50,
    "price": 699,
    "original_price": null,
    "discount_pct": null,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/iyerosun.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/iyerosun.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-IYEROSUN-01",
        "stock": 10,
        "price": 699
      }
    ],
    "all_categories": [
      "complementos-y-herramientas",
      "enseres"
    ]
  },
  {
    "id": 185,
    "slug": "jabon-arobi-riqueza-y-antibrujeria",
    "sku": "OJA-JABONARO",
    "name": "Jabon Arobi / RIQUEZA Y ANTIBRUJERIA",
    "description": "♦ Jabón con Akose para Riqueza y Evitar los daños por Brujería | • 130 grs Aproximado",
    "base_price": 861.21,
    "price_with_tax": 999,
    "effective_price": 999,
    "stock": 10,
    "category_name": "Akoses / Medicinas",
    "category": {
      "id": 2,
      "name": "Akoses / Medicinas",
      "slug": "akoses-medicinas",
      "product_count": 74
    },
    "is_featured": false,
    "rating_avg": 5,
    "review_count": 2,
    "price": 999,
    "original_price": null,
    "discount_pct": null,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/jabon-arobi-riqueza-y-antibrujeria.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/jabon-arobi-riqueza-y-antibrujeria.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-JABONARO-01",
        "stock": 10,
        "price": 999
      }
    ],
    "all_categories": [
      "akoses-medicinas",
      "lo-nuevo"
    ]
  },
  {
    "id": 186,
    "slug": "jabon-negro",
    "sku": "OJA-JABONNEG",
    "name": "Jabón Negro / Ose Dudu",
    "description": "♦ Jabón Negro / Ose Dudu, elaboración nacional con los mismos ingredientes y medicina que la elaboración Nigeriana pero con mejor consistencia. | • Consistencia como plastilina, esto permite mayor durabilidad a los baños y mejor incorporación con la medicina",
    "base_price": 257.76,
    "price_with_tax": 299,
    "effective_price": 299,
    "stock": 10,
    "category_name": "Akoses / Medicinas",
    "category": {
      "id": 2,
      "name": "Akoses / Medicinas",
      "slug": "akoses-medicinas",
      "product_count": 74
    },
    "is_featured": false,
    "rating_avg": 4.93,
    "review_count": 15,
    "price": 299,
    "original_price": null,
    "discount_pct": null,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/jabón-negro-ose-dudu.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/jabón-negro-ose-dudu.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-JABONNEG-01",
        "stock": 10,
        "price": 299
      }
    ],
    "all_categories": [
      "akoses-medicinas",
      "enseres"
    ]
  },
  {
    "id": 187,
    "slug": "ose-dudu-pasta",
    "sku": "OJA-OSEDUDUP",
    "name": "Jabón Negro / Ose Dudu en Pasta",
    "description": "♦ Jabón Negro Africano | • Consistencia de Pasta, tarro de 1 libra.",
    "base_price": 387.07,
    "price_with_tax": 449,
    "effective_price": 449,
    "stock": 10,
    "category_name": "Enseres",
    "category": {
      "id": 6,
      "name": "Enseres",
      "slug": "enseres",
      "product_count": 29
    },
    "is_featured": false,
    "rating_avg": 5,
    "review_count": 13,
    "price": 449,
    "original_price": 500,
    "discount_pct": 10.2,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/jabón-negro-ose-dudu-en-pasta.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/jabón-negro-ose-dudu-en-pasta.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-OSEDUDUP-01",
        "stock": 10,
        "price": 449
      }
    ],
    "all_categories": [
      "enseres"
    ]
  },
  {
    "id": 188,
    "slug": "jabon-nigeriano",
    "sku": "OJA-JABONNIG",
    "name": "Jabón Negro / Ose Dudu Nigeriano",
    "description": "♦ Jabón Negro / Ose Dudu, Importado de Nigeria | • Cantidad 1 Libra por barra | • Consistencia de “Pan”, esto permite mayor durabilidad a los baños y mejor incorporación con la medicina",
    "base_price": 343.97,
    "price_with_tax": 399,
    "effective_price": 399,
    "stock": 10,
    "category_name": "Enseres",
    "category": {
      "id": 6,
      "name": "Enseres",
      "slug": "enseres",
      "product_count": 29
    },
    "is_featured": false,
    "rating_avg": 4.98,
    "review_count": 46,
    "price": 399,
    "original_price": 450,
    "discount_pct": 11.3,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/jabón-negro-ose-dudu-nigeriano.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/jabón-negro-ose-dudu-nigeriano.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-JABONNIG-01",
        "stock": 10,
        "price": 399
      }
    ],
    "all_categories": [
      "enseres"
    ]
  },
  {
    "id": 189,
    "slug": "dudu_osun",
    "sku": "OJA-DUDU_OSU",
    "name": "Jabón Negro / Ose Dudu Osun en Barra 150gr",
    "description": "♦ Jabón Negro Africano en Barra. | • Barra de 150 grs, marca Dudu Osun | • Jabón Solido",
    "base_price": 154.31,
    "price_with_tax": 179,
    "effective_price": 179,
    "stock": 10,
    "category_name": "Enseres",
    "category": {
      "id": 6,
      "name": "Enseres",
      "slug": "enseres",
      "product_count": 29
    },
    "is_featured": false,
    "rating_avg": 5,
    "review_count": 11,
    "price": 179,
    "original_price": 250,
    "discount_pct": 28.4,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/jabón-negro-ose-dudu-osun-en-barra-150gr.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/jabón-negro-ose-dudu-osun-en-barra-150gr.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-DUDU_OSU-01",
        "stock": 10,
        "price": 179
      }
    ],
    "all_categories": [
      "enseres"
    ]
  },
  {
    "id": 190,
    "slug": "jabon-negro-con-akose-jabon-con-medicina",
    "sku": "OJA-JABONNEG",
    "name": "Jabón Negro con Akose / Jabón con Medicina",
    "description": "♦ Jabón con medicina 1 Libra cada jabón: | Antibrujeria | Salud | Vencimiento de Enemigos | Riqueza • El jabón con akose es una preparación ritual importante en la religión Yoruba, que combina elementos espirituales y naturales para diversos propósitos. Akose se refiere a mezclas especiales de hierbas, aceites y otros ingredientes utilizados para fines espirituales y mágicos. | • El jabón con akose es una preparación ritual importante en la religión Yoruba, que combina elementos espirituales y naturales para diversos propósitos. Akose se refiere a mezclas especiales de hierbas, aceites y otros ingredientes utilizados para fines espirituales y mágicos.",
    "base_price": 516.38,
    "price_with_tax": 599,
    "effective_price": 599,
    "stock": 10,
    "category_name": "Akoses / Medicinas",
    "category": {
      "id": 2,
      "name": "Akoses / Medicinas",
      "slug": "akoses-medicinas",
      "product_count": 74
    },
    "is_featured": false,
    "rating_avg": 5,
    "review_count": 20,
    "price": 599,
    "original_price": null,
    "discount_pct": null,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/jabón-negro-con-akose-jabón-con-medicina.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/jabón-negro-con-akose-jabón-con-medicina.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-JABONNEG-01",
        "stock": 10,
        "price": 599
      }
    ],
    "all_categories": [
      "akoses-medicinas",
      "enseres"
    ]
  },
  {
    "id": 191,
    "slug": "juego-de-ibos",
    "sku": "OJA-JUEGODEI",
    "name": "Juego de Ibos",
    "description": "♦ Ibos 7 Pzs por Juego. | • Los Ibos son objetos ritualistas utilizados en la religión Yoruba y en el sistema de adivinación de Ifá. • Estos objetos consisten en conjuntos de Semillas, Huesos, Caracoles y Cerámicas.",
    "base_price": 387.07,
    "price_with_tax": 449,
    "effective_price": 449,
    "stock": 10,
    "category_name": "Complementos y Herramientas",
    "category": {
      "id": 5,
      "name": "Complementos y Herramientas",
      "slug": "complementos-y-herramientas",
      "product_count": 45
    },
    "is_featured": false,
    "rating_avg": 5,
    "review_count": 3,
    "price": 449,
    "original_price": null,
    "discount_pct": null,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/juego-de-ibos.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/juego-de-ibos.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-JUEGODEI-01",
        "stock": 10,
        "price": 449
      }
    ],
    "all_categories": [
      "complementos-y-herramientas",
      "lo-nuevo"
    ]
  },
  {
    "id": 192,
    "slug": "koko-ajere-isefa",
    "sku": "OJA-KOKOAJER",
    "name": "Koko / Ajere Isefa",
    "description": "♦ Medidas: Altura → 12 Cm Diámetro → 17 Cm | ⇒ Ideales para Isefa (Mano de Orula) | • En la religión Yoruba los Koko son recipientes esculpidos en barro. • Son objetos sagrados utilizados en rituales y ceremonias para funcionar como recipiente para los Ikines de Ifa.",
    "base_price": 145.69,
    "price_with_tax": 169,
    "effective_price": 169,
    "stock": 10,
    "category_name": "Complementos y Herramientas",
    "category": {
      "id": 5,
      "name": "Complementos y Herramientas",
      "slug": "complementos-y-herramientas",
      "product_count": 45
    },
    "is_featured": false,
    "rating_avg": 5,
    "review_count": 47,
    "price": 169,
    "original_price": null,
    "discount_pct": null,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/koko-ajere-isefa.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/koko-ajere-isefa.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-KOKOAJER-01",
        "stock": 10,
        "price": 169
      }
    ],
    "all_categories": [
      "complementos-y-herramientas",
      "isan-iconos"
    ]
  },
  {
    "id": 193,
    "slug": "navaja-para-incisiones",
    "sku": "OJA-NAVAJAPA",
    "name": "Navaja para Incisiones 10 Pzs Dobles",
    "description": "♦ Navajas para aplicación de Akose en Incisiones | • Caja con 10 navajas dobles",
    "base_price": 30.17,
    "price_with_tax": 35,
    "effective_price": 35,
    "stock": 10,
    "category_name": "Akoses / Medicinas",
    "category": {
      "id": 2,
      "name": "Akoses / Medicinas",
      "slug": "akoses-medicinas",
      "product_count": 74
    },
    "is_featured": false,
    "rating_avg": 5,
    "review_count": 5,
    "price": 35,
    "original_price": null,
    "discount_pct": null,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/navaja-para-incisiones-10-pzs-dobles.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/navaja-para-incisiones-10-pzs-dobles.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-NAVAJAPA-01",
        "stock": 10,
        "price": 35
      }
    ],
    "all_categories": [
      "akoses-medicinas"
    ]
  },
  {
    "id": 194,
    "slug": "obi-abata",
    "sku": "OJA-OBIABATA",
    "name": "Obi Abata",
    "description": "♦ Presentación de 1/2 Libra | ⇒ Nota: Si deseas 1 Libra favor de seleccionar 2 piezas y así sucesivamente | • El “Obi Abata” o nuez de cola es un elemento central y sagrado en las prácticas religiosas Yoruba, Esta pequeña semilla marrón, conocida por su forma característica en gajos y sabor amargo, es altamente reverenciada por los seguidores de la religion yoruba debido a su profundo significado simbólico y su papel como medio de comunicación con los Orisas. • El Obi Abata se utiliza comúnmente en consultas adivinatorias y rituales consagratorios, donde se emplea como herramienta para obtener respuestas y orientación de los Orisas.",
    "base_price": 516.38,
    "price_with_tax": 599,
    "effective_price": 599,
    "stock": 10,
    "category_name": "Enseres",
    "category": {
      "id": 6,
      "name": "Enseres",
      "slug": "enseres",
      "product_count": 29
    },
    "is_featured": false,
    "rating_avg": 4.83,
    "review_count": 72,
    "price": 599,
    "original_price": 650,
    "discount_pct": 7.8,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/obi-abata.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/obi-abata.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-OBIABATA-01",
        "stock": 10,
        "price": 599
      }
    ],
    "all_categories": [
      "enseres",
      "semillas"
    ]
  },
  {
    "id": 195,
    "slug": "odo-sango",
    "sku": "OJA-ODOSANGO",
    "name": "Odo Sango / Recipiente de Sango",
    "description": "♦ Medidas Odo: • 35 Cm de altura • 28 Cm de diámetro ♦ Medidas Plato: • 28 Cm de diámetro | • En la religión Yoruba los Odo Sango son esculpidos en madera. • Son objetos sagrados utilizados en rituales y ceremonias para funcionar como recipiente de la deidad Sango.",
    "base_price": 7757.76,
    "price_with_tax": 8999,
    "effective_price": 8999,
    "stock": 10,
    "category_name": "Isan / Iconos",
    "category": {
      "id": 4,
      "name": "Isan / Iconos",
      "slug": "isan-iconos",
      "product_count": 67
    },
    "is_featured": false,
    "rating_avg": 5,
    "review_count": 2,
    "price": 8999,
    "original_price": 11000,
    "discount_pct": 18.2,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/odo-sango-recipiente-de-sango.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/odo-sango-recipiente-de-sango.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-ODOSANGO-01",
        "stock": 10,
        "price": 8999
      }
    ],
    "all_categories": [
      "isan-iconos"
    ]
  },
  {
    "id": 196,
    "slug": "odo-sango-completo-recipiente-de-sango",
    "sku": "OJA-ODOSANGO",
    "name": "Odo Sango Completo / Recipiente de Sango",
    "description": "♦ Contiene – Agboran, Plato, Odo y 2 Hachas | ♦ Medida Total: • 65 Cm de altura ♦ Medida Agboran: • 35 Cm de altura ♦ Medidas Odo: • 26 Cm de altura • 17 Cm de diámetro ♦ Medidas Plato: • 25 Cm de diámetro • 09 Cm de altura ♦ Medidas Hachas: • 36 Cm de largo | • En la religión Yoruba los Odo Sango son esculpidos en madera. • Son objetos sagrados utilizados en rituales y ceremonias para funcionar como recipiente de la deidad Sango.",
    "base_price": 6895.69,
    "price_with_tax": 7999,
    "effective_price": 7999,
    "stock": 10,
    "category_name": "Isan / Iconos",
    "category": {
      "id": 4,
      "name": "Isan / Iconos",
      "slug": "isan-iconos",
      "product_count": 67
    },
    "is_featured": false,
    "rating_avg": 0,
    "review_count": 0,
    "price": 7999,
    "original_price": 9000,
    "discount_pct": 11.1,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/odo-sango-completo-recipiente-de-sango.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/odo-sango-completo-recipiente-de-sango.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-ODOSANGO-01",
        "stock": 10,
        "price": 7999
      }
    ],
    "all_categories": [
      "isan-iconos"
    ]
  },
  {
    "id": 197,
    "slug": "ogun-aso-ode",
    "sku": "OJA-OGUNASOO",
    "name": "Ogun con Aso Ode / PIEZA UNICA",
    "description": "♦ Ogun con Aso Ode | • Con Ikoberes y Resguardos relacionados con Ogun, para la Protección, Prosperidad y Vencimiento • Medida: 60 cm de Altura",
    "base_price": 15516.38,
    "price_with_tax": 17999,
    "effective_price": 17999,
    "stock": 10,
    "category_name": "Isan / Iconos",
    "category": {
      "id": 4,
      "name": "Isan / Iconos",
      "slug": "isan-iconos",
      "product_count": 67
    },
    "is_featured": false,
    "rating_avg": 0,
    "review_count": 0,
    "price": 17999,
    "original_price": 23000,
    "discount_pct": 21.7,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/ogun-con-aso-ode-pieza-unica.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/ogun-con-aso-ode-pieza-unica.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-OGUNASOO-01",
        "stock": 10,
        "price": 17999
      }
    ],
    "all_categories": [
      "isan-iconos",
      "lo-nuevo"
    ]
  },
  {
    "id": 198,
    "slug": "okete",
    "sku": "OJA-OKETE",
    "name": "Okete Nigeriana",
    "description": "♦ Rata Africana Grande (20 a 25 Cm de Cuerpo Aproximado) | NOTA: Secada de forma natural, sin ningún Químico dañino al organismo | 👇 Aprovecha Descuento por Volumen 👇",
    "base_price": 517.24,
    "price_with_tax": 600,
    "effective_price": 600,
    "stock": 10,
    "category_name": "Enseres",
    "category": {
      "id": 6,
      "name": "Enseres",
      "slug": "enseres",
      "product_count": 29
    },
    "is_featured": false,
    "rating_avg": 4.93,
    "review_count": 27,
    "price": 600,
    "original_price": null,
    "discount_pct": null,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/okete-nigeriana.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/okete-nigeriana.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-OKETE-01",
        "stock": 10,
        "price": 600
      }
    ],
    "all_categories": [
      "enseres",
      "mayoreo"
    ]
  },
  {
    "id": 199,
    "slug": "ologbohun",
    "sku": "OJA-OLOGBOHU",
    "name": "Ologbohun / Potencializa el Ase",
    "description": "Ologbohun es un Akose que manifiesta y potencializa el Ase, el don divino que todos tenemos para que las cosas que deseamos o pedimos se den por decretarlo. | Tamaño 20 a 30 Centímetros Aproximadamente.",
    "base_price": 3016.38,
    "price_with_tax": 3499,
    "effective_price": 3499,
    "stock": 10,
    "category_name": "Akoses / Medicinas",
    "category": {
      "id": 2,
      "name": "Akoses / Medicinas",
      "slug": "akoses-medicinas",
      "product_count": 74
    },
    "is_featured": false,
    "rating_avg": 5,
    "review_count": 3,
    "price": 3499,
    "original_price": 5000,
    "discount_pct": 30,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/ologbohun-potencializa-el-ase.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/ologbohun-potencializa-el-ase.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-OLOGBOHU-01",
        "stock": 10,
        "price": 3499
      }
    ],
    "all_categories": [
      "akoses-medicinas"
    ]
  },
  {
    "id": 200,
    "slug": "opa-egungun",
    "sku": "OJA-OPAEGUNG",
    "name": "Opa Egungun",
    "description": "♦ Opa Egungun | • 36 cm de Altura, Isan de Egungun",
    "base_price": 2412.93,
    "price_with_tax": 2799,
    "effective_price": 2799,
    "stock": 10,
    "category_name": "Isan / Iconos",
    "category": {
      "id": 4,
      "name": "Isan / Iconos",
      "slug": "isan-iconos",
      "product_count": 67
    },
    "is_featured": false,
    "rating_avg": 5,
    "review_count": 5,
    "price": 2799,
    "original_price": null,
    "discount_pct": null,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/opa-egungun.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/opa-egungun.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-OPAEGUNG-01",
        "stock": 10,
        "price": 2799
      }
    ],
    "all_categories": [
      "isan-iconos"
    ]
  },
  {
    "id": 201,
    "slug": "opa-ogun",
    "sku": "OJA-OPAOGUN",
    "name": "Opa Ogun",
    "description": "♦ Opa Ogun | • Altura de 22 a 25 Cm • Diámetro 18 a 20 Cm",
    "base_price": 1033.62,
    "price_with_tax": 1199,
    "effective_price": 1199,
    "stock": 10,
    "category_name": "Complementos y Herramientas",
    "category": {
      "id": 5,
      "name": "Complementos y Herramientas",
      "slug": "complementos-y-herramientas",
      "product_count": 45
    },
    "is_featured": false,
    "rating_avg": 0,
    "review_count": 0,
    "price": 1199,
    "original_price": null,
    "discount_pct": null,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/opa-ogun.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/opa-ogun.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-OPAOGUN-01",
        "stock": 10,
        "price": 1199
      }
    ],
    "all_categories": [
      "complementos-y-herramientas",
      "isan-iconos"
    ]
  },
  {
    "id": 202,
    "slug": "opa-osun",
    "sku": "OJA-OPAOSUN",
    "name": "Opa Osun",
    "description": "♦ Medida 145 cm de altura • Armable (Atornillable) | • Ave principal y 6 Aves pequeñas",
    "base_price": 3275,
    "price_with_tax": 3799,
    "effective_price": 3799,
    "stock": 10,
    "category_name": "Isan / Iconos",
    "category": {
      "id": 4,
      "name": "Isan / Iconos",
      "slug": "isan-iconos",
      "product_count": 67
    },
    "is_featured": false,
    "rating_avg": 0,
    "review_count": 0,
    "price": 3799,
    "original_price": 5500,
    "discount_pct": 30.9,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/opa-osun.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/opa-osun.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-OPAOSUN-01",
        "stock": 10,
        "price": 3799
      }
    ],
    "all_categories": [
      "isan-iconos",
      "lo-nuevo"
    ]
  },
  {
    "id": 203,
    "slug": "opa-ozayin",
    "sku": "OJA-OPAOZAYI",
    "name": "Opa Ozayin",
    "description": "♦ Opa Ozayin | • Altura de 40 a 45 Cm",
    "base_price": 1206.03,
    "price_with_tax": 1399,
    "effective_price": 1399,
    "stock": 10,
    "category_name": "Complementos y Herramientas",
    "category": {
      "id": 5,
      "name": "Complementos y Herramientas",
      "slug": "complementos-y-herramientas",
      "product_count": 45
    },
    "is_featured": false,
    "rating_avg": 5,
    "review_count": 0,
    "price": 1399,
    "original_price": null,
    "discount_pct": null,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/opa-ozayin.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/opa-ozayin.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-OPAOZAYI-01",
        "stock": 10,
        "price": 1399
      }
    ],
    "all_categories": [
      "complementos-y-herramientas",
      "isan-iconos"
    ]
  },
  {
    "id": 204,
    "slug": "opele-bronce",
    "sku": "OJA-OPELEBRO",
    "name": "Opele de Bronce",
    "description": "♦ Opele completamente de Bronce • 35 cm de largo | • El “Opele de Bronce” es una exquisitez artesanal que evoca la esencia de la adivinación y la sabiduría en la tradición yoruba. • Elaborado con bronce de alta calidad, estos Opeles presentan una serie de cuentas entrelazadas que reflejan la complejidad de la vida y el destino. • Con cada movimiento, este instrumento ancestral desencadena un diálogo profundo con Ifa, ofreciendo una conexión única con los oráculos.",
    "base_price": 1119.83,
    "price_with_tax": 1299,
    "effective_price": 1299,
    "stock": 10,
    "category_name": "Complementos y Herramientas",
    "category": {
      "id": 5,
      "name": "Complementos y Herramientas",
      "slug": "complementos-y-herramientas",
      "product_count": 45
    },
    "is_featured": false,
    "rating_avg": 5,
    "review_count": 2,
    "price": 1299,
    "original_price": 1600,
    "discount_pct": 18.8,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/opele-de-bronce.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/opele-de-bronce.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-OPELEBRO-01",
        "stock": 10,
        "price": 1299
      }
    ],
    "all_categories": [
      "complementos-y-herramientas"
    ]
  },
  {
    "id": 205,
    "slug": "opele-de-bronce-elefante",
    "sku": "OJA-OPELEDEB",
    "name": "Opele de Bronce Elefante",
    "description": "♦ Opele completamente de Bronce con rostro de Elefante • 39 cm de largo | • El “Opele de Bronce” es una exquisitez artesanal que evoca la esencia de la adivinación y la sabiduría en la tradición yoruba. • Elaborado con bronce de alta calidad, estos Opeles presentan una serie de cuentas entrelazadas que reflejan la complejidad de la vida y el destino. • Con cada movimiento, este instrumento ancestral desencadena un diálogo profundo con Ifa, ofreciendo una conexión única con los oráculos.",
    "base_price": 1292.24,
    "price_with_tax": 1499,
    "effective_price": 1499,
    "stock": 10,
    "category_name": "Complementos y Herramientas",
    "category": {
      "id": 5,
      "name": "Complementos y Herramientas",
      "slug": "complementos-y-herramientas",
      "product_count": 45
    },
    "is_featured": false,
    "rating_avg": 0,
    "review_count": 0,
    "price": 1499,
    "original_price": 2200,
    "discount_pct": 31.9,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/opele-de-bronce-elefante.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/opele-de-bronce-elefante.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-OPELEDEB-01",
        "stock": 10,
        "price": 1499
      }
    ],
    "all_categories": [
      "complementos-y-herramientas",
      "lo-nuevo"
    ]
  },
  {
    "id": 206,
    "slug": "opele-gbere",
    "sku": "OJA-OPELEGBE",
    "name": "Opele de Semilla Gbere",
    "description": "♦ Opele de Semilla de Gbere | • Cuentas de Orumila",
    "base_price": 775,
    "price_with_tax": 899,
    "effective_price": 899,
    "stock": 10,
    "category_name": "Complementos y Herramientas",
    "category": {
      "id": 5,
      "name": "Complementos y Herramientas",
      "slug": "complementos-y-herramientas",
      "product_count": 45
    },
    "is_featured": false,
    "rating_avg": 4.7,
    "review_count": 10,
    "price": 899,
    "original_price": 1200,
    "discount_pct": 25.1,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/opele-de-semilla-gbere.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/opele-de-semilla-gbere.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-OPELEGBE-01",
        "stock": 10,
        "price": 899
      }
    ],
    "all_categories": [
      "complementos-y-herramientas",
      "semillas"
    ]
  },
  {
    "id": 207,
    "slug": "opele-de-ope",
    "sku": "OJA-OPELEDEO",
    "name": "Opele de Semilla Ope",
    "description": "♦ 45 Cm de Largo | • El Opelé es una cadena de adivinación que consta de cuentas de semilla de ope ensartadas en una secuencia específica. • Los sacerdotes de Ifá utilizan este Opelé durante las consultas adivinatorias para comunicarse con Orumila y obtener orientación espiritual y consejos para la toma de decisiones. | • Modelos Disponibles ⇓⇓⇓",
    "base_price": 818.1,
    "price_with_tax": 949,
    "effective_price": 949,
    "stock": 10,
    "category_name": "Complementos y Herramientas",
    "category": {
      "id": 5,
      "name": "Complementos y Herramientas",
      "slug": "complementos-y-herramientas",
      "product_count": 45
    },
    "is_featured": false,
    "rating_avg": 5,
    "review_count": 3,
    "price": 949,
    "original_price": 1499,
    "discount_pct": 36.7,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/opele-de-semilla-ope.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/opele-de-semilla-ope.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-OPELEDEO-01",
        "stock": 10,
        "price": 949
      }
    ],
    "all_categories": [
      "complementos-y-herramientas",
      "lo-nuevo"
    ]
  },
  {
    "id": 208,
    "slug": "opon-akose-ovalado",
    "sku": "OJA-OPONAKOS",
    "name": "Opon Akose / Tablero Akose Ovalado",
    "description": "♦ Tablero para Akoses “Alto Relieve” → Medida Ext – 24 x 17 Cm Aprox → Medida Int – 14 x 8 Cm Aprox | • Explora nuestra exclusiva colección de tableros para Akose, inspirados en tradición de la medicina africana. | • Modelos Disponibles ⇓⇓⇓",
    "base_price": 818.1,
    "price_with_tax": 949,
    "effective_price": 949,
    "stock": 10,
    "category_name": "Akoses / Medicinas",
    "category": {
      "id": 2,
      "name": "Akoses / Medicinas",
      "slug": "akoses-medicinas",
      "product_count": 74
    },
    "is_featured": false,
    "rating_avg": 5,
    "review_count": 0,
    "price": 949,
    "original_price": null,
    "discount_pct": null,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/opon-akose-tablero-akose-ovalado.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/opon-akose-tablero-akose-ovalado.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-OPONAKOS-01",
        "stock": 10,
        "price": 949
      }
    ],
    "all_categories": [
      "akoses-medicinas",
      "complementos-y-herramientas",
      "isan-iconos"
    ]
  },
  {
    "id": 209,
    "slug": "opon-akose-redondo",
    "sku": "OJA-OPONAKOS",
    "name": "Opon Akose / Tablero Akose Redondo",
    "description": "♦ Tablero para Akoses Redondo ⇒ 20 Cm de Diámetro | • Explora nuestra exclusiva colección de tableros para Akose, inspirados en tradición de la medicina africana. | • Modelos Disponibles ⇓⇓⇓",
    "base_price": 1206.03,
    "price_with_tax": 1399,
    "effective_price": 1399,
    "stock": 10,
    "category_name": "Akoses / Medicinas",
    "category": {
      "id": 2,
      "name": "Akoses / Medicinas",
      "slug": "akoses-medicinas",
      "product_count": 74
    },
    "is_featured": false,
    "rating_avg": 5,
    "review_count": 0,
    "price": 1399,
    "original_price": 1700,
    "discount_pct": 17.7,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/opon-akose-tablero-akose-redondo.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/opon-akose-tablero-akose-redondo.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-OPONAKOS-01",
        "stock": 10,
        "price": 1399
      }
    ],
    "all_categories": [
      "akoses-medicinas",
      "complementos-y-herramientas",
      "isan-iconos",
      "lo-nuevo"
    ]
  },
  {
    "id": 210,
    "slug": "opon-akose-rostros",
    "sku": "OJA-OPONAKOS",
    "name": "Opon Akose / Tablero Akose Rostros",
    "description": "♦ Tablero para Akoses en Obalo con 16 Rostros de Esu | ⇒ Medidas 30 x 18 Cm de exterior y 22 x 10 Cm de Interior | • Explora nuestra exclusiva colección de tableros para Akose, inspirados en tradición de la medicina africana. • Cada tablero está diseñado para ofrecerte una auténtica experiencia en la práctica de Akose, permitiéndote conectarte con las raíces de la medicina tradicional africana. • Descubre la sabiduría ancestral a través de estos tableros meticulosamente elaborados y empieza tu viaje hacia el bienestar y la conexión espiritual.",
    "base_price": 1292.24,
    "price_with_tax": 1499,
    "effective_price": 1499,
    "stock": 10,
    "category_name": "Akoses / Medicinas",
    "category": {
      "id": 2,
      "name": "Akoses / Medicinas",
      "slug": "akoses-medicinas",
      "product_count": 74
    },
    "is_featured": false,
    "rating_avg": 0,
    "review_count": 0,
    "price": 1499,
    "original_price": null,
    "discount_pct": null,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/opon-akose-tablero-akose-rostros.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/opon-akose-tablero-akose-rostros.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-OPONAKOS-01",
        "stock": 10,
        "price": 1499
      }
    ],
    "all_categories": [
      "akoses-medicinas",
      "complementos-y-herramientas",
      "isan-iconos",
      "varios"
    ]
  },
  {
    "id": 211,
    "slug": "opon-ifa-grande",
    "sku": "OJA-OPONIFAG",
    "name": "Opon Ifa / Tablero Grande",
    "description": "♦ Tablero de Ifa Africano, Diseños Únicos. ⇒ Nota: Presiona los Botones para ver los Modelos disponibles con Imágenes → 40 a 50 Cm de Diámetro según el Modelo | • Modelos Disponibles ⇓⇓⇓",
    "base_price": 2154.31,
    "price_with_tax": 2499,
    "effective_price": 2499,
    "stock": 10,
    "category_name": "Complementos y Herramientas",
    "category": {
      "id": 5,
      "name": "Complementos y Herramientas",
      "slug": "complementos-y-herramientas",
      "product_count": 45
    },
    "is_featured": false,
    "rating_avg": 4.83,
    "review_count": 6,
    "price": 2499,
    "original_price": null,
    "discount_pct": null,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/opon-ifa-tablero-grande.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/opon-ifa-tablero-grande.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-OPONIFAG-01",
        "stock": 10,
        "price": 2499
      }
    ],
    "all_categories": [
      "complementos-y-herramientas",
      "isan-iconos"
    ]
  },
  {
    "id": 212,
    "slug": "ori-shea-butter",
    "sku": "OJA-ORISHEAB",
    "name": "Ori / Shea Butter 200 Grs",
    "description": "♦ Ori / Shea Butter presentación de 200 grs | • Bote plástico de 200 gramos de Ori / Shea Butter",
    "base_price": 198.28,
    "price_with_tax": 230,
    "effective_price": 230,
    "stock": 10,
    "category_name": "Akoses / Medicinas",
    "category": {
      "id": 2,
      "name": "Akoses / Medicinas",
      "slug": "akoses-medicinas",
      "product_count": 74
    },
    "is_featured": false,
    "rating_avg": 5,
    "review_count": 23,
    "price": 230,
    "original_price": 250,
    "discount_pct": 8,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/ori-shea-butter-200-grs.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/ori-shea-butter-200-grs.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-ORISHEAB-01",
        "stock": 10,
        "price": 230
      }
    ],
    "all_categories": [
      "akoses-medicinas",
      "enseres"
    ]
  },
  {
    "id": 213,
    "slug": "orisa-oro",
    "sku": "OJA-ORISAORO",
    "name": "Orisa Oro",
    "description": "♦ Madera con tonalidad Blanca • Contiene: Agboran, 2 flechas de madera y 1 de metal | • Medidas: Agboran – 42 cm F. Madera – 39 cm F. Metal – 30 cm",
    "base_price": 4309.48,
    "price_with_tax": 4999,
    "effective_price": 4999,
    "stock": 10,
    "category_name": "Isan / Iconos",
    "category": {
      "id": 4,
      "name": "Isan / Iconos",
      "slug": "isan-iconos",
      "product_count": 67
    },
    "is_featured": false,
    "rating_avg": 5,
    "review_count": 0,
    "price": 4999,
    "original_price": 7000,
    "discount_pct": 28.6,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/orisa-oro.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/orisa-oro.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-ORISAORO-01",
        "stock": 10,
        "price": 4999
      }
    ],
    "all_categories": [
      "isan-iconos",
      "lo-nuevo"
    ]
  },
  {
    "id": 214,
    "slug": "orogbo",
    "sku": "OJA-OROGBO",
    "name": "Orogbo",
    "description": "♦ Presentación de 1/2 Libra | ⇒ Nota: Si deseas 1 Libra favor de seleccionar 2 piezas y así sucesivamente | • El “Orogbo” o nuez amarga es un elemento esencial dentro de las prácticas religiosas de la religión Yoruba • El Orogbo se utiliza como ofrenda para establecer una conexión entre los fieles y los Orisas • Antes de realizar una petición o al enfrentar desafíos, los practicantes pueden presentar el Orogbo como un símbolo de humildad y respeto hacia los Orisas.",
    "base_price": 473.28,
    "price_with_tax": 549,
    "effective_price": 549,
    "stock": 10,
    "category_name": "Enseres",
    "category": {
      "id": 6,
      "name": "Enseres",
      "slug": "enseres",
      "product_count": 29
    },
    "is_featured": false,
    "rating_avg": 4.95,
    "review_count": 56,
    "price": 549,
    "original_price": 650,
    "discount_pct": 15.5,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/orogbo.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/orogbo.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-OROGBO-01",
        "stock": 10,
        "price": 549
      }
    ],
    "all_categories": [
      "enseres",
      "semillas"
    ]
  },
  {
    "id": 215,
    "slug": "osun",
    "sku": "OJA-OSUN",
    "name": "Osun – Camwood – 1/4 Libra",
    "description": "♦ Bolsa de 1/4 de Libra Nota: Si desea media libra seleccionar 2 piezas y así sucesivamente. | ♦ Bolsa de 1/4 de Libra | Nota: Si desea media libra seleccionar 2 piezas y así sucesivamente.",
    "base_price": 280.17,
    "price_with_tax": 325,
    "effective_price": 325,
    "stock": 10,
    "category_name": "Enseres",
    "category": {
      "id": 6,
      "name": "Enseres",
      "slug": "enseres",
      "product_count": 29
    },
    "is_featured": false,
    "rating_avg": 5,
    "review_count": 12,
    "price": 325,
    "original_price": null,
    "discount_pct": null,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/osun-–-camwood-–-1-4-libra.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/osun-–-camwood-–-1-4-libra.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-OSUN-01",
        "stock": 10,
        "price": 325
      }
    ],
    "all_categories": [
      "enseres"
    ]
  },
  {
    "id": 216,
    "slug": "oya-base-y-plato",
    "sku": "OJA-OYABASEY",
    "name": "Oya / Agboran, Base y Plato",
    "description": "♦ Contiene – Agboran, Plato y Base | ♦ Medida Total: • 65 Cm de altura ♦ Medida Agboran: • 35 Cm de altura ♦ Medidas Base: • 26 Cm de altura • 17 Cm de diámetro ♦ Medidas Plato: • 25 Cm de diámetro • 9 Cm de altura | • En la religión Yoruba los Isan Oya son esculpidos en madera. • Son objetos sagrados utilizados en rituales y ceremonias para funcionar como recipiente de la deidad Oya.",
    "base_price": 6464.66,
    "price_with_tax": 7499,
    "effective_price": 7499,
    "stock": 10,
    "category_name": "Isan / Iconos",
    "category": {
      "id": 4,
      "name": "Isan / Iconos",
      "slug": "isan-iconos",
      "product_count": 67
    },
    "is_featured": false,
    "rating_avg": 5,
    "review_count": 0,
    "price": 7499,
    "original_price": 8500,
    "discount_pct": 11.8,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/oya-agboran-base-y-plato.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/oya-agboran-base-y-plato.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-OYABASEY-01",
        "stock": 10,
        "price": 7499
      }
    ],
    "all_categories": [
      "isan-iconos"
    ]
  },
  {
    "id": 217,
    "slug": "oyin-miel",
    "sku": "OJA-OYINMIEL",
    "name": "Oyin / Miel 710 gr",
    "description": "♦ Miel de Abeja PURA | • Presentación de 710 gr. • Envase y boquilla de fácil aplicación.",
    "base_price": 128.45,
    "price_with_tax": 149,
    "effective_price": 149,
    "stock": 10,
    "category_name": "Enseres",
    "category": {
      "id": 6,
      "name": "Enseres",
      "slug": "enseres",
      "product_count": 29
    },
    "is_featured": false,
    "rating_avg": 5,
    "review_count": 2,
    "price": 149,
    "original_price": 200,
    "discount_pct": 25.5,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/oyin-miel-710-gr.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/oyin-miel-710-gr.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-OYINMIEL-01",
        "stock": 10,
        "price": 149
      }
    ],
    "all_categories": [
      "enseres"
    ]
  },
  {
    "id": 218,
    "slug": "paquete-egbe-eleko",
    "sku": "OJA-PAQUETEE",
    "name": "Paquete / Egbe Eleko",
    "description": "♦ Aprovecha Un Descuento al comprar todo lo que necesitas para Egbe Orun | • Este paquete incluye los siguientes productos ⇓⇓⇓",
    "base_price": 3306.16,
    "price_with_tax": 3835.15,
    "effective_price": 3835.15,
    "stock": 10,
    "category_name": "Lo Nuevo",
    "category": {
      "id": 1,
      "name": "Lo Nuevo",
      "slug": "lo-nuevo",
      "product_count": 82
    },
    "is_featured": false,
    "rating_avg": 0,
    "review_count": 0,
    "price": 3835.15,
    "original_price": 4578,
    "discount_pct": 16.2,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/paquete-egbe-eleko.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/paquete-egbe-eleko.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-PAQUETEE-01",
        "stock": 10,
        "price": 3835.15
      }
    ],
    "all_categories": [
      "lo-nuevo",
      "paquetes"
    ]
  },
  {
    "id": 219,
    "slug": "paquete-egbe-orun",
    "sku": "OJA-PAQUETEE",
    "name": "Paquete / Egbe Orun",
    "description": "♦ Aprovecha Un Descuento al comprar todo lo que necesitas para Egbe Orun | • Este paquete incluye los siguientes productos ⇓⇓⇓",
    "base_price": 2160.43,
    "price_with_tax": 2506.1,
    "effective_price": 2506.1,
    "stock": 10,
    "category_name": "Lo Nuevo",
    "category": {
      "id": 1,
      "name": "Lo Nuevo",
      "slug": "lo-nuevo",
      "product_count": 82
    },
    "is_featured": false,
    "rating_avg": 5,
    "review_count": 0,
    "price": 2506.1,
    "original_price": 3179,
    "discount_pct": 21.2,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/paquete-egbe-orun.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/paquete-egbe-orun.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-PAQUETEE-01",
        "stock": 10,
        "price": 2506.1
      }
    ],
    "all_categories": [
      "lo-nuevo",
      "paquetes"
    ]
  },
  {
    "id": 220,
    "slug": "paquete-isan-egungun",
    "sku": "OJA-PAQUETEI",
    "name": "Paquete / Egungun Isan",
    "description": "♦ Aprovecha Un Descuento al comprar todo lo que necesitas para Isan Egungun | • Este paquete incluye los siguientes productos ⇓⇓⇓",
    "base_price": 1791.9,
    "price_with_tax": 2078.6,
    "effective_price": 2078.6,
    "stock": 10,
    "category_name": "Lo Nuevo",
    "category": {
      "id": 1,
      "name": "Lo Nuevo",
      "slug": "lo-nuevo",
      "product_count": 82
    },
    "is_featured": false,
    "rating_avg": 0,
    "review_count": 0,
    "price": 2078.6,
    "original_price": 2228,
    "discount_pct": 6.7,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/paquete-egungun-isan.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/paquete-egungun-isan.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-PAQUETEI-01",
        "stock": 10,
        "price": 2078.6
      }
    ],
    "all_categories": [
      "lo-nuevo",
      "paquetes"
    ]
  },
  {
    "id": 221,
    "slug": "paquete-opa-egungun",
    "sku": "OJA-PAQUETEO",
    "name": "Paquete / Egungun Opa",
    "description": "♦ Aprovecha Un Descuento al comprar todo lo que necesitas para Opa Egungun | • Este paquete incluye los siguientes productos ⇓⇓⇓",
    "base_price": 2889.31,
    "price_with_tax": 3351.6,
    "effective_price": 3351.6,
    "stock": 10,
    "category_name": "Lo Nuevo",
    "category": {
      "id": 1,
      "name": "Lo Nuevo",
      "slug": "lo-nuevo",
      "product_count": 82
    },
    "is_featured": false,
    "rating_avg": 0,
    "review_count": 0,
    "price": 3351.6,
    "original_price": 3528,
    "discount_pct": 5,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/paquete-egungun-opa.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/paquete-egungun-opa.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-PAQUETEO-01",
        "stock": 10,
        "price": 3351.6
      }
    ],
    "all_categories": [
      "lo-nuevo",
      "paquetes"
    ]
  },
  {
    "id": 222,
    "slug": "paquete-isefa",
    "sku": "OJA-PAQUETEI",
    "name": "Paquete / Isefa",
    "description": "♦ Aprovecha Un Descuento al comprar todo lo que necesitas para Isefa (Mano de Orula) | • Este paquete incluye los siguientes productos ⇓⇓⇓",
    "base_price": 718.23,
    "price_with_tax": 833.15,
    "effective_price": 833.15,
    "stock": 10,
    "category_name": "Lo Nuevo",
    "category": {
      "id": 1,
      "name": "Lo Nuevo",
      "slug": "lo-nuevo",
      "product_count": 82
    },
    "is_featured": false,
    "rating_avg": 0,
    "review_count": 0,
    "price": 833.15,
    "original_price": 1018,
    "discount_pct": 18.2,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/paquete-isefa.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/paquete-isefa.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-PAQUETEI-01",
        "stock": 10,
        "price": 833.15
      }
    ],
    "all_categories": [
      "lo-nuevo",
      "paquetes"
    ]
  },
  {
    "id": 223,
    "slug": "edan",
    "sku": "OJA-EDAN",
    "name": "Pareja de Edan",
    "description": "♦ Pareja de Edan de Bronce sin collar | • 8 Centímetros de largos.",
    "base_price": 688.79,
    "price_with_tax": 799,
    "effective_price": 799,
    "stock": 10,
    "category_name": "Complementos y Herramientas",
    "category": {
      "id": 5,
      "name": "Complementos y Herramientas",
      "slug": "complementos-y-herramientas",
      "product_count": 45
    },
    "is_featured": false,
    "rating_avg": 5,
    "review_count": 2,
    "price": 799,
    "original_price": null,
    "discount_pct": null,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/pareja-de-edan.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/pareja-de-edan.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-EDAN-01",
        "stock": 10,
        "price": 799
      }
    ],
    "all_categories": [
      "complementos-y-herramientas",
      "isan-iconos"
    ]
  },
  {
    "id": 224,
    "slug": "peinetas-de-osun",
    "sku": "OJA-PEINETAS",
    "name": "Peinetas de Osun",
    "description": "♦ Se utiliza como adorno ritual y elemento del Isan Osun. • Tradicionalmente hecha de madera, y lleva grabados con motivos Yoruba. | • Medidas: Mod-01 / 20×12 cm Mod-02 / 20×10 cm Mod-03 / 27×07 cm | • Modelos Disponibles ⇓⇓⇓",
    "base_price": 731.9,
    "price_with_tax": 849,
    "effective_price": 849,
    "stock": 10,
    "category_name": "Isan / Iconos",
    "category": {
      "id": 4,
      "name": "Isan / Iconos",
      "slug": "isan-iconos",
      "product_count": 67
    },
    "is_featured": false,
    "rating_avg": 0,
    "review_count": 0,
    "price": 849,
    "original_price": null,
    "discount_pct": null,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/peinetas-de-osun.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/peinetas-de-osun.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-PEINETAS-01",
        "stock": 10,
        "price": 849
      }
    ],
    "all_categories": [
      "isan-iconos",
      "lo-nuevo"
    ]
  },
  {
    "id": 225,
    "slug": "piedra-yangi",
    "sku": "OJA-PIEDRAYA",
    "name": "Piedra Yangi",
    "description": "♦ Piedra Yangi Africana | • Varios Tamaños y Pesos, verifica los Precios seleccionando los Modelos. | • Modelos Disponibles ⇓⇓⇓",
    "base_price": 1466.38,
    "price_with_tax": 1701,
    "effective_price": 1701,
    "stock": 10,
    "category_name": "Isan / Iconos",
    "category": {
      "id": 4,
      "name": "Isan / Iconos",
      "slug": "isan-iconos",
      "product_count": 67
    },
    "is_featured": false,
    "rating_avg": 5,
    "review_count": 10,
    "price": 1701,
    "original_price": null,
    "discount_pct": null,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/piedra-yangi.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/piedra-yangi.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-PIEDRAYA-01",
        "stock": 10,
        "price": 1701
      }
    ],
    "all_categories": [
      "isan-iconos"
    ]
  },
  {
    "id": 226,
    "slug": "plato-barro",
    "sku": "OJA-PLATOBAR",
    "name": "Plato de Barro",
    "description": "♦ Plato de Barro de 25 cm de Diámetro por 10 cm de Altura | • Plato ideal para Esus",
    "base_price": 73.28,
    "price_with_tax": 85,
    "effective_price": 85,
    "stock": 10,
    "category_name": "Complementos y Herramientas",
    "category": {
      "id": 5,
      "name": "Complementos y Herramientas",
      "slug": "complementos-y-herramientas",
      "product_count": 45
    },
    "is_featured": false,
    "rating_avg": 4.87,
    "review_count": 15,
    "price": 85,
    "original_price": null,
    "discount_pct": null,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/plato-de-barro.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/plato-de-barro.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-PLATOBAR-01",
        "stock": 10,
        "price": 85
      }
    ],
    "all_categories": [
      "complementos-y-herramientas",
      "isan-iconos"
    ]
  },
  {
    "id": 227,
    "slug": "plato-de-barro-chico",
    "sku": "OJA-PLATODEB",
    "name": "Plato de Barro Chico",
    "description": "♦ Plato de Barro de 17 cm de Diámetro por 5 cm de Altura | • Plato ideal para Ebos y Esus pequeños",
    "base_price": 47.41,
    "price_with_tax": 55,
    "effective_price": 55,
    "stock": 10,
    "category_name": "Complementos y Herramientas",
    "category": {
      "id": 5,
      "name": "Complementos y Herramientas",
      "slug": "complementos-y-herramientas",
      "product_count": 45
    },
    "is_featured": false,
    "rating_avg": 4.79,
    "review_count": 19,
    "price": 55,
    "original_price": null,
    "discount_pct": null,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/plato-de-barro-chico.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/plato-de-barro-chico.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-PLATODEB-01",
        "stock": 10,
        "price": 55
      }
    ],
    "all_categories": [
      "complementos-y-herramientas",
      "isan-iconos"
    ]
  },
  {
    "id": 228,
    "slug": "plumas-de-agbe",
    "sku": "OJA-PLUMASDE",
    "name": "Pluma de Agbe",
    "description": "♦ Pluma de pájaro Taruco",
    "base_price": 120.69,
    "price_with_tax": 140,
    "effective_price": 140,
    "stock": 10,
    "category_name": "Akoses / Medicinas",
    "category": {
      "id": 2,
      "name": "Akoses / Medicinas",
      "slug": "akoses-medicinas",
      "product_count": 74
    },
    "is_featured": false,
    "rating_avg": 5,
    "review_count": 22,
    "price": 140,
    "original_price": null,
    "discount_pct": null,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/pluma-de-agbe.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/pluma-de-agbe.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-PLUMASDE-01",
        "stock": 10,
        "price": 140
      }
    ],
    "all_categories": [
      "akoses-medicinas",
      "complementos-y-herramientas"
    ]
  },
  {
    "id": 229,
    "slug": "pluma-de-aluko",
    "sku": "OJA-PLUMADEA",
    "name": "Pluma de Aluko",
    "description": "♦ Pluma de pájaro Turaco",
    "base_price": 120.69,
    "price_with_tax": 140,
    "effective_price": 140,
    "stock": 10,
    "category_name": "Akoses / Medicinas",
    "category": {
      "id": 2,
      "name": "Akoses / Medicinas",
      "slug": "akoses-medicinas",
      "product_count": 74
    },
    "is_featured": false,
    "rating_avg": 4.95,
    "review_count": 21,
    "price": 140,
    "original_price": null,
    "discount_pct": null,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/pluma-de-aluko.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/pluma-de-aluko.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-PLUMADEA-01",
        "stock": 10,
        "price": 140
      }
    ],
    "all_categories": [
      "akoses-medicinas",
      "complementos-y-herramientas"
    ]
  },
  {
    "id": 230,
    "slug": "ikodie",
    "sku": "OJA-IKODIE",
    "name": "Pluma de Loro / Odidere",
    "description": "• La pluma roja de loro africano es un elemento altamente valorado en la religión Yoruba debido a su significado simbólico y espiritual. • Estas plumas, que provienen del loro africano, se utilizan en ceremonias y rituales como símbolo de la comunicación con lo divino.",
    "base_price": 145.69,
    "price_with_tax": 169,
    "effective_price": 169,
    "stock": 10,
    "category_name": "Complementos y Herramientas",
    "category": {
      "id": 5,
      "name": "Complementos y Herramientas",
      "slug": "complementos-y-herramientas",
      "product_count": 45
    },
    "is_featured": false,
    "rating_avg": 4.87,
    "review_count": 38,
    "price": 169,
    "original_price": 220,
    "discount_pct": 23.2,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/pluma-de-loro-odidere.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/pluma-de-loro-odidere.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-IKODIE-01",
        "stock": 10,
        "price": 169
      }
    ],
    "all_categories": [
      "complementos-y-herramientas",
      "enseres"
    ]
  },
  {
    "id": 231,
    "slug": "iyun-azul",
    "sku": "OJA-IYUNAZUL",
    "name": "Pulsera Azul / Ide de cuenta Iyun",
    "description": "Pulsera de cuenta Iyun Azul | Ideal para los adoradores de Yemoja, Olokun",
    "base_price": 301.72,
    "price_with_tax": 350,
    "effective_price": 350,
    "stock": 10,
    "category_name": "Collares y Pulseras",
    "category": {
      "id": 3,
      "name": "Collares y Pulseras",
      "slug": "collares-y-pulseras",
      "product_count": 69
    },
    "is_featured": false,
    "rating_avg": 5,
    "review_count": 6,
    "price": 350,
    "original_price": null,
    "discount_pct": null,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/pulsera-azul-ide-de-cuenta-iyun.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/pulsera-azul-ide-de-cuenta-iyun.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-IYUNAZUL-01",
        "stock": 10,
        "price": 350
      }
    ],
    "all_categories": [
      "collares-y-pulseras"
    ]
  },
  {
    "id": 232,
    "slug": "pulsera-azul-cristal",
    "sku": "OJA-PULSERAA",
    "name": "Pulsera Azul Cristal",
    "description": "♦ Pulsera con cuentas de Cristal. | • 23 Cm de largo aproximado",
    "base_price": 343.97,
    "price_with_tax": 399,
    "effective_price": 399,
    "stock": 10,
    "category_name": "Collares y Pulseras",
    "category": {
      "id": 3,
      "name": "Collares y Pulseras",
      "slug": "collares-y-pulseras",
      "product_count": 69
    },
    "is_featured": false,
    "rating_avg": 0,
    "review_count": 0,
    "price": 399,
    "original_price": null,
    "discount_pct": null,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/pulsera-azul-cristal.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/pulsera-azul-cristal.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-PULSERAA-01",
        "stock": 10,
        "price": 399
      }
    ],
    "all_categories": [
      "collares-y-pulseras",
      "lo-nuevo"
    ]
  },
  {
    "id": 233,
    "slug": "pulsera-blanca-ide-de-arcilla",
    "sku": "OJA-PULSERAB",
    "name": "Pulsera Blanca / Ide de Arcilla",
    "description": "♦ Pulsera de Arcilla • 25 Cm de Largo | • Ideal para los adoradores de Obatala, Orisa Aje, Oduwa",
    "base_price": 387.07,
    "price_with_tax": 449,
    "effective_price": 449,
    "stock": 10,
    "category_name": "Collares y Pulseras",
    "category": {
      "id": 3,
      "name": "Collares y Pulseras",
      "slug": "collares-y-pulseras",
      "product_count": 69
    },
    "is_featured": false,
    "rating_avg": 0,
    "review_count": 0,
    "price": 449,
    "original_price": 550,
    "discount_pct": 18.4,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/pulsera-blanca-ide-de-arcilla.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/pulsera-blanca-ide-de-arcilla.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-PULSERAB-01",
        "stock": 10,
        "price": 449
      }
    ],
    "all_categories": [
      "collares-y-pulseras",
      "lo-nuevo"
    ]
  },
  {
    "id": 234,
    "slug": "iyun-blanco",
    "sku": "OJA-IYUNBLAN",
    "name": "Pulsera Blanca / Ide de cuenta Iyun",
    "description": "♦ Pulsera de cuenta Iyun Blanco | • Ideal para los adoradores de Obatala, Aje, Oduwa",
    "base_price": 301.72,
    "price_with_tax": 350,
    "effective_price": 350,
    "stock": 10,
    "category_name": "Collares y Pulseras",
    "category": {
      "id": 3,
      "name": "Collares y Pulseras",
      "slug": "collares-y-pulseras",
      "product_count": 69
    },
    "is_featured": false,
    "rating_avg": 5,
    "review_count": 3,
    "price": 350,
    "original_price": null,
    "discount_pct": null,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/pulsera-blanca-ide-de-cuenta-iyun.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/pulsera-blanca-ide-de-cuenta-iyun.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-IYUNBLAN-01",
        "stock": 10,
        "price": 350
      }
    ],
    "all_categories": [
      "collares-y-pulseras"
    ]
  },
  {
    "id": 235,
    "slug": "ide-orisas",
    "sku": "OJA-IDEORISA",
    "name": "Pulsera de Orisas / Ide cuenta chica",
    "description": "♦ Pulsera de 2 hilos y cuenta chica • 20 Cm de larga | • Modelos Disponibles ⇓⇓⇓",
    "base_price": 128.45,
    "price_with_tax": 149,
    "effective_price": 149,
    "stock": 10,
    "category_name": "Collares y Pulseras",
    "category": {
      "id": 3,
      "name": "Collares y Pulseras",
      "slug": "collares-y-pulseras",
      "product_count": 69
    },
    "is_featured": false,
    "rating_avg": 5,
    "review_count": 0,
    "price": 149,
    "original_price": 200,
    "discount_pct": 25.5,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/pulsera-de-orisas-ide-cuenta-chica.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/pulsera-de-orisas-ide-cuenta-chica.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-IDEORISA-01",
        "stock": 10,
        "price": 149
      }
    ],
    "all_categories": [
      "collares-y-pulseras"
    ]
  },
  {
    "id": 236,
    "slug": "ide-cuenta-chica",
    "sku": "OJA-IDECUENT",
    "name": "Pulsera de Orula / Ide cuenta chica",
    "description": "♦ Pulsera de Orumila cuenta Otutu Opon Chica, con Ikin de 4 ojos y sin Ikin | ⇒ La decoración extra puede cambiar según el lote que recibamos de Nigeria | • Las pulseras de Otutu Opon en la religión Yoruba son objetos significativos que se utilizan como símbolos de conexión espiritual con Orunmila, una deidad asociada con la adivinación y la sabiduría en la tradición Yoruba. • Usar estas pulseras es una forma de honrar a Orunmila y buscar su influencia positiva en la vida cotidiana.",
    "base_price": 171.55,
    "price_with_tax": 199,
    "effective_price": 199,
    "stock": 10,
    "category_name": "Collares de Orumila",
    "category": {
      "id": 7,
      "name": "Collares de Orumila",
      "slug": "collares-de-orumila",
      "product_count": 18
    },
    "is_featured": false,
    "rating_avg": 5,
    "review_count": 8,
    "price": 199,
    "original_price": null,
    "discount_pct": null,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/pulsera-de-orula-ide-cuenta-chica.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/pulsera-de-orula-ide-cuenta-chica.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-IDECUENT-01",
        "stock": 10,
        "price": 199
      }
    ],
    "all_categories": [
      "collares-de-orumila",
      "collares-y-pulseras"
    ]
  },
  {
    "id": 237,
    "slug": "ide-ikin",
    "sku": "OJA-IDEIKIN",
    "name": "Pulsera de Orula / Ide cuenta grande",
    "description": "♦ Pulsera de Orumila cuenta Otutu Opon Grande, con Ikin de 4 ojos y sin Ikin | • Las pulseras de Otutu Opon en la religión Yoruba son objetos significativos que se utilizan como símbolos de conexión espiritual con Orunmila, una deidad asociada con la adivinación y la sabiduría en la tradición Yoruba. • Usar estas pulseras es una forma de honrar a Orunmila y buscar su influencia positiva en la vida cotidiana.",
    "base_price": 171.55,
    "price_with_tax": 199,
    "effective_price": 199,
    "stock": 10,
    "category_name": "Collares de Orumila",
    "category": {
      "id": 7,
      "name": "Collares de Orumila",
      "slug": "collares-de-orumila",
      "product_count": 18
    },
    "is_featured": false,
    "rating_avg": 5,
    "review_count": 3,
    "price": 199,
    "original_price": null,
    "discount_pct": null,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/pulsera-de-orula-ide-cuenta-grande.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/pulsera-de-orula-ide-cuenta-grande.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-IDEIKIN-01",
        "stock": 10,
        "price": 199
      }
    ],
    "all_categories": [
      "collares-de-orumila",
      "collares-y-pulseras"
    ]
  },
  {
    "id": 238,
    "slug": "ide-orumila-segi",
    "sku": "OJA-IDEORUMI",
    "name": "Pulsera de Orula con Segi",
    "description": "♦ Pulsera con cuentas grandes de Orumila y pieza de Segi. | • Otutu Opon Grande y piedra Segi. 23 Cm de largo aproximado",
    "base_price": 343.97,
    "price_with_tax": 399,
    "effective_price": 399,
    "stock": 10,
    "category_name": "Collares y Pulseras",
    "category": {
      "id": 3,
      "name": "Collares y Pulseras",
      "slug": "collares-y-pulseras",
      "product_count": 69
    },
    "is_featured": false,
    "rating_avg": 5,
    "review_count": 4,
    "price": 399,
    "original_price": null,
    "discount_pct": null,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/pulsera-de-orula-con-segi.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/pulsera-de-orula-con-segi.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-IDEORUMI-01",
        "stock": 10,
        "price": 399
      }
    ],
    "all_categories": [
      "collares-y-pulseras"
    ]
  },
  {
    "id": 239,
    "slug": "pulsera-de-orula-cristal",
    "sku": "OJA-PULSERAD",
    "name": "Pulsera de Orula Cristal",
    "description": "♦ Pulsera con cuentas grandes de Orumila. | • 23 Cm de largo aproximado",
    "base_price": 343.97,
    "price_with_tax": 399,
    "effective_price": 399,
    "stock": 10,
    "category_name": "Collares y Pulseras",
    "category": {
      "id": 3,
      "name": "Collares y Pulseras",
      "slug": "collares-y-pulseras",
      "product_count": 69
    },
    "is_featured": false,
    "rating_avg": 0,
    "review_count": 0,
    "price": 399,
    "original_price": null,
    "discount_pct": null,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/pulsera-de-orula-cristal.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/pulsera-de-orula-cristal.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-PULSERAD-01",
        "stock": 10,
        "price": 399
      }
    ],
    "all_categories": [
      "collares-y-pulseras",
      "lo-nuevo"
    ]
  },
  {
    "id": 240,
    "slug": "ide-segi",
    "sku": "OJA-IDESEGI",
    "name": "Pulsera de Segi",
    "description": "♦ Pulsera de cuenta Segi original, cuenta Grande | • Considerado como la cuenta de la Realeza y Atrae la Riqueza.",
    "base_price": 732.76,
    "price_with_tax": 850,
    "effective_price": 850,
    "stock": 10,
    "category_name": "Collares y Pulseras",
    "category": {
      "id": 3,
      "name": "Collares y Pulseras",
      "slug": "collares-y-pulseras",
      "product_count": 69
    },
    "is_featured": false,
    "rating_avg": 5,
    "review_count": 0,
    "price": 850,
    "original_price": null,
    "discount_pct": null,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/pulsera-de-segi.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/pulsera-de-segi.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-IDESEGI-01",
        "stock": 10,
        "price": 850
      }
    ],
    "all_categories": [
      "collares-y-pulseras"
    ]
  },
  {
    "id": 241,
    "slug": "ide-esu-iyun",
    "sku": "OJA-IDEESUIY",
    "name": "Pulsera Esu de Iyun",
    "description": "♦ Pulsera de Esu color negro con rojo. | • Cuenta Iyun de 1.5 cm cada cuenta. | • Medida total del Ide 22 cm a lo largo.",
    "base_price": 300.86,
    "price_with_tax": 349,
    "effective_price": 349,
    "stock": 10,
    "category_name": "Collares y Pulseras",
    "category": {
      "id": 3,
      "name": "Collares y Pulseras",
      "slug": "collares-y-pulseras",
      "product_count": 69
    },
    "is_featured": false,
    "rating_avg": 4.75,
    "review_count": 4,
    "price": 349,
    "original_price": null,
    "discount_pct": null,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/pulsera-esu-de-iyun.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/pulsera-esu-de-iyun.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-IDEESUIY-01",
        "stock": 10,
        "price": 349
      }
    ],
    "all_categories": [
      "collares-y-pulseras"
    ]
  },
  {
    "id": 242,
    "slug": "pulsera-oxido-cristal",
    "sku": "OJA-PULSERAO",
    "name": "Pulsera Oxido Cristal",
    "description": "♦ Pulsera con cuentas de Cristal. | • 23 Cm de largo aproximado",
    "base_price": 343.97,
    "price_with_tax": 399,
    "effective_price": 399,
    "stock": 10,
    "category_name": "Collares y Pulseras",
    "category": {
      "id": 3,
      "name": "Collares y Pulseras",
      "slug": "collares-y-pulseras",
      "product_count": 69
    },
    "is_featured": false,
    "rating_avg": 0,
    "review_count": 0,
    "price": 399,
    "original_price": null,
    "discount_pct": null,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/pulsera-oxido-cristal.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/pulsera-oxido-cristal.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-PULSERAO-01",
        "stock": 10,
        "price": 399
      }
    ],
    "all_categories": [
      "collares-y-pulseras",
      "lo-nuevo"
    ]
  },
  {
    "id": 243,
    "slug": "pulsera-oxido-cristal-tambor",
    "sku": "OJA-PULSERAO",
    "name": "Pulsera Oxido Cristal con Tambor",
    "description": "♦ Pulsera con cuentas de Cristal. | • 23 Cm de largo aproximado",
    "base_price": 343.97,
    "price_with_tax": 399,
    "effective_price": 399,
    "stock": 10,
    "category_name": "Collares y Pulseras",
    "category": {
      "id": 3,
      "name": "Collares y Pulseras",
      "slug": "collares-y-pulseras",
      "product_count": 69
    },
    "is_featured": false,
    "rating_avg": 0,
    "review_count": 0,
    "price": 399,
    "original_price": null,
    "discount_pct": null,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/pulsera-oxido-cristal-con-tambor.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/pulsera-oxido-cristal-con-tambor.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-PULSERAO-01",
        "stock": 10,
        "price": 399
      }
    ],
    "all_categories": [
      "collares-y-pulseras",
      "lo-nuevo"
    ]
  },
  {
    "id": 244,
    "slug": "iyun-pulsera-de-cuenta-iyun",
    "sku": "OJA-IYUNPULS",
    "name": "Pulsera Roja / Ide de cuenta Iyun",
    "description": "♦ Pulsera de cuenta Iyun | • Atrae la riqueza y también ideal para los adoradores de Sango y Oya",
    "base_price": 301.72,
    "price_with_tax": 350,
    "effective_price": 350,
    "stock": 10,
    "category_name": "Collares y Pulseras",
    "category": {
      "id": 3,
      "name": "Collares y Pulseras",
      "slug": "collares-y-pulseras",
      "product_count": 69
    },
    "is_featured": false,
    "rating_avg": 5,
    "review_count": 4,
    "price": 350,
    "original_price": null,
    "discount_pct": null,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/pulsera-roja-ide-de-cuenta-iyun.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/pulsera-roja-ide-de-cuenta-iyun.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-IYUNPULS-01",
        "stock": 10,
        "price": 350
      }
    ],
    "all_categories": [
      "collares-y-pulseras"
    ]
  },
  {
    "id": 245,
    "slug": "ide-sango-de-iyun",
    "sku": "OJA-IDESANGO",
    "name": "Pulsera Sango de Iyun",
    "description": "♦ Pulsera de Sango color blanco con rojo. | • Cuenta Iyun de 1.5 cm cada cuenta. | • Medida total del Ide 22 cm a lo largo.",
    "base_price": 300.86,
    "price_with_tax": 349,
    "effective_price": 349,
    "stock": 10,
    "category_name": "Collares y Pulseras",
    "category": {
      "id": 3,
      "name": "Collares y Pulseras",
      "slug": "collares-y-pulseras",
      "product_count": 69
    },
    "is_featured": false,
    "rating_avg": 5,
    "review_count": 3,
    "price": 349,
    "original_price": null,
    "discount_pct": null,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/pulsera-sango-de-iyun.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/pulsera-sango-de-iyun.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-IDESANGO-01",
        "stock": 10,
        "price": 349
      }
    ],
    "all_categories": [
      "collares-y-pulseras"
    ]
  },
  {
    "id": 246,
    "slug": "rostro-odudua",
    "sku": "OJA-ROSTROOD",
    "name": "Rostro de Odudua",
    "description": "♦ Cabeza de madera, Rostro de Odudua | • Medidas: 30 cm altura y 40 cm de circunferencia",
    "base_price": 2499.14,
    "price_with_tax": 2899,
    "effective_price": 2899,
    "stock": 10,
    "category_name": "Complementos y Herramientas",
    "category": {
      "id": 5,
      "name": "Complementos y Herramientas",
      "slug": "complementos-y-herramientas",
      "product_count": 45
    },
    "is_featured": false,
    "rating_avg": 0,
    "review_count": 0,
    "price": 2899,
    "original_price": null,
    "discount_pct": null,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/rostro-de-odudua.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/rostro-de-odudua.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-ROSTROOD-01",
        "stock": 10,
        "price": 2899
      }
    ],
    "all_categories": [
      "complementos-y-herramientas",
      "isan-iconos"
    ]
  },
  {
    "id": 247,
    "slug": "sekere-opo",
    "sku": "OJA-SEKEREOP",
    "name": "Sekere Opo / Sekere de Exito y Abundancia",
    "description": "♦ Sekere para la Abundancia y el Éxito de posicionarse en donde uno esta destinado • Ya sea empleo, negocio, familia etc… y que la gente lo estime y respete. | • Se debe sonar constantemente haciendo la petición deseada.",
    "base_price": 603.45,
    "price_with_tax": 700,
    "effective_price": 700,
    "stock": 10,
    "category_name": "Akoses / Medicinas",
    "category": {
      "id": 2,
      "name": "Akoses / Medicinas",
      "slug": "akoses-medicinas",
      "product_count": 74
    },
    "is_featured": false,
    "rating_avg": 4.95,
    "review_count": 21,
    "price": 700,
    "original_price": 2000,
    "discount_pct": 65,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/sekere-opo-sekere-de-exito-y-abundancia.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/sekere-opo-sekere-de-exito-y-abundancia.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-SEKEREOP-01",
        "stock": 10,
        "price": 700
      }
    ],
    "all_categories": [
      "akoses-medicinas"
    ]
  },
  {
    "id": 248,
    "slug": "semilla-gbere",
    "sku": "OJA-SEMILLAG",
    "name": "Semilla de Gbere",
    "description": "♦ Semilla de Gbere, costo por pieza. | • Nota: Para armar 1 Opele seleccionar 8 piezas",
    "base_price": 68.1,
    "price_with_tax": 79,
    "effective_price": 79,
    "stock": 10,
    "category_name": "Complementos y Herramientas",
    "category": {
      "id": 5,
      "name": "Complementos y Herramientas",
      "slug": "complementos-y-herramientas",
      "product_count": 45
    },
    "is_featured": false,
    "rating_avg": 0,
    "review_count": 0,
    "price": 79,
    "original_price": 99,
    "discount_pct": 20.2,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/semilla-de-gbere.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/semilla-de-gbere.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-SEMILLAG-01",
        "stock": 10,
        "price": 79
      }
    ],
    "all_categories": [
      "complementos-y-herramientas",
      "isan-iconos",
      "semillas"
    ]
  },
  {
    "id": 249,
    "slug": "semilla-ope",
    "sku": "OJA-SEMILLAO",
    "name": "Semilla de Ope",
    "description": "♦ Semilla de Ope (Pieza UNIDA) | • Semillas de tamaño Mediano y Grande (sujeto a el tamaño disponible) | De 4 a 6 Cm de Largos",
    "base_price": 42.24,
    "price_with_tax": 49,
    "effective_price": 49,
    "stock": 10,
    "category_name": "Enseres",
    "category": {
      "id": 6,
      "name": "Enseres",
      "slug": "enseres",
      "product_count": 29
    },
    "is_featured": false,
    "rating_avg": 4.67,
    "review_count": 6,
    "price": 49,
    "original_price": 90,
    "discount_pct": 45.6,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/semilla-de-ope.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/semilla-de-ope.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-SEMILLAO-01",
        "stock": 10,
        "price": 49
      }
    ],
    "all_categories": [
      "enseres",
      "semillas"
    ]
  },
  {
    "id": 250,
    "slug": "tambor-africano",
    "sku": "OJA-TAMBORAF",
    "name": "Tambor Africano",
    "description": "Ayan Bata – 3 Piezas | Altura / 70 cm – 50 cm – 25 cm.",
    "base_price": 15516.38,
    "price_with_tax": 17999,
    "effective_price": 17999,
    "stock": 10,
    "category_name": "Isan / Iconos",
    "category": {
      "id": 4,
      "name": "Isan / Iconos",
      "slug": "isan-iconos",
      "product_count": 67
    },
    "is_featured": false,
    "rating_avg": 0,
    "review_count": 0,
    "price": 17999,
    "original_price": null,
    "discount_pct": null,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/tambor-africano.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/tambor-africano.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-TAMBORAF-01",
        "stock": 10,
        "price": 17999
      }
    ],
    "all_categories": [
      "isan-iconos"
    ]
  },
  {
    "id": 251,
    "slug": "titulo-de-ifa",
    "sku": "OJA-TITULODE",
    "name": "Titulo de Ifa",
    "description": "♦ Collar Titulo de Ifa ⇒ El modelo-01 tiene cauris en el contorno del titulo y Uniones de Cuentas en el Collar | ⇒ Medidas: → Titulo – 12 x 9 → Collar – 50 Aprox (doblado)",
    "base_price": 1206.03,
    "price_with_tax": 1399,
    "effective_price": 1399,
    "stock": 10,
    "category_name": "Collares y Pulseras",
    "category": {
      "id": 3,
      "name": "Collares y Pulseras",
      "slug": "collares-y-pulseras",
      "product_count": 69
    },
    "is_featured": false,
    "rating_avg": 0,
    "review_count": 0,
    "price": 1399,
    "original_price": null,
    "discount_pct": null,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/titulo-de-ifa.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/titulo-de-ifa.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-TITULODE-01",
        "stock": 10,
        "price": 1399
      }
    ],
    "all_categories": [
      "collares-y-pulseras",
      "titulos"
    ]
  },
  {
    "id": 252,
    "slug": "titulo-de-ogboni",
    "sku": "OJA-TITULODE",
    "name": "Titulo de Ogboni",
    "description": "♦ Collar Titulo de Ogboni | ⇒ Medidas: → Titulo – 10 x 8 → Collar – 40 Aprox (doblado)",
    "base_price": 861.21,
    "price_with_tax": 999,
    "effective_price": 999,
    "stock": 10,
    "category_name": "Collares y Pulseras",
    "category": {
      "id": 3,
      "name": "Collares y Pulseras",
      "slug": "collares-y-pulseras",
      "product_count": 69
    },
    "is_featured": false,
    "rating_avg": 0,
    "review_count": 0,
    "price": 999,
    "original_price": null,
    "discount_pct": null,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/titulo-de-ogboni.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/titulo-de-ogboni.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-TITULODE-01",
        "stock": 10,
        "price": 999
      }
    ],
    "all_categories": [
      "collares-y-pulseras",
      "titulos"
    ]
  },
  {
    "id": 253,
    "slug": "titulos-orisa",
    "sku": "OJA-TITULOSO",
    "name": "Títulos de Orisa",
    "description": "♦ Collares con nombre de Orisas. • 45 Cm de Largo",
    "base_price": 818.1,
    "price_with_tax": 949,
    "effective_price": 949,
    "stock": 10,
    "category_name": "Collares y Pulseras",
    "category": {
      "id": 3,
      "name": "Collares y Pulseras",
      "slug": "collares-y-pulseras",
      "product_count": 69
    },
    "is_featured": false,
    "rating_avg": 5,
    "review_count": 8,
    "price": 949,
    "original_price": null,
    "discount_pct": null,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/títulos-de-orisa.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/títulos-de-orisa.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-TITULOSO-01",
        "stock": 10,
        "price": 949
      }
    ],
    "all_categories": [
      "collares-y-pulseras",
      "titulos"
    ]
  },
  {
    "id": 254,
    "slug": "traje-dashiki-yoruba",
    "sku": "OJA-TRAJEDAS",
    "name": "Traje Dashiki Yoruba “Preguntar por Diseños Disponibles”",
    "description": "♦ Trajes Dashiki Yoruba completos, Sujeto a Diseños Disponibles | Tallas: L – XL | • ESTAS IMÁGENES SOLO SON DE INFORMACIÓN YA QUE LOS MODELOS VARÍAN CADA LOTE RECIBIDO, PARA SABER DISEÑOS DISPONIBLES PREGUNTAR POR WHATSAPP.",
    "base_price": 3878.45,
    "price_with_tax": 4499,
    "effective_price": 4499,
    "stock": 10,
    "category_name": "Ropa y Telas",
    "category": {
      "id": 10,
      "name": "Ropa y Telas",
      "slug": "ropa-y-telas",
      "product_count": 8
    },
    "is_featured": false,
    "rating_avg": 0,
    "review_count": 0,
    "price": 4499,
    "original_price": null,
    "discount_pct": null,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/traje-dashiki-yoruba-“preguntar-por-diseños-disponibles”.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/traje-dashiki-yoruba-“preguntar-por-diseños-disponibles”.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-TRAJEDAS-01",
        "stock": 10,
        "price": 4499
      }
    ],
    "all_categories": [
      "ropa-y-telas"
    ]
  },
  {
    "id": 255,
    "slug": "traje-yoruba",
    "sku": "OJA-TRAJEYOR",
    "name": "Traje Yoruba Hombre",
    "description": "♦ Trajes Yoruba NOTA: Verifica en la imagen del modelo si incluyera Fila (gorro) • Modelos Disponibles ⇓⇓⇓",
    "base_price": 1550.86,
    "price_with_tax": 1799,
    "effective_price": 1799,
    "stock": 10,
    "category_name": "Lo Nuevo",
    "category": {
      "id": 1,
      "name": "Lo Nuevo",
      "slug": "lo-nuevo",
      "product_count": 82
    },
    "is_featured": false,
    "rating_avg": 5,
    "review_count": 12,
    "price": 1799,
    "original_price": null,
    "discount_pct": null,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/traje-yoruba-hombre.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/traje-yoruba-hombre.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-TRAJEYOR-01",
        "stock": 10,
        "price": 1799
      }
    ],
    "all_categories": [
      "lo-nuevo",
      "ropa-y-telas"
    ]
  },
  {
    "id": 256,
    "slug": "traje-yoruba-mujer",
    "sku": "OJA-TRAJEYOR",
    "name": "Traje Yoruba Mujer",
    "description": "♦ Algunos incluyen Gele • Modelos Disponibles ⇓⇓⇓",
    "base_price": 990.52,
    "price_with_tax": 1149,
    "effective_price": 1149,
    "stock": 10,
    "category_name": "Lo Nuevo",
    "category": {
      "id": 1,
      "name": "Lo Nuevo",
      "slug": "lo-nuevo",
      "product_count": 82
    },
    "is_featured": false,
    "rating_avg": 5,
    "review_count": 0,
    "price": 1149,
    "original_price": null,
    "discount_pct": null,
    "images": [
      {
        "id": 1,
        "url": "/catalog/images/traje-yoruba-mujer.png",
        "is_main": true
      }
    ],
    "image_url": "/catalog/images/traje-yoruba-mujer.png",
    "variants": [
      {
        "id": 1,
        "name": "Unico",
        "sku": "OJA-TRAJEYOR-01",
        "stock": 10,
        "price": 1149
      }
    ],
    "all_categories": [
      "lo-nuevo",
      "ropa-y-telas"
    ]
  }
];


// Tipos inferidos de los arrays generados.
export type CatalogCategory = (typeof CATALOG_CATEGORIES)[number];
export type CatalogProduct  = (typeof CATALOG_PRODUCTS)[number];
