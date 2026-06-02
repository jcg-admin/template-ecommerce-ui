/**
 * ProductPage — Práctica Yorùbà
 * Detalle de producto con galería, selector de variantes,
 * trust strip y descripción extendida.
 *
 * Endpoints:
 *   GET /catalogue/{slug}/
 *   POST /cart/items/
 *   POST /wishlist/
 */

import Popover    from '@components/common/Popover/Popover';
import ScrollSpy  from '@components/common/ScrollSpy/ScrollSpy';
import { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectIsInWishlist } from '@redux/selectors';
import { Link, useParams, useNavigate, Navigate } from 'react-router-dom';
import { fetchProduct } from '@redux/slices/catalogSlice';
import { addCartItem } from '@redux/slices/cartSlice';
import { toggleWishlist } from '@redux/slices/wishlistSlice';
import ProductCard from '@components/catalog/ProductCard';
import { MetaTag, Price, Button } from '@components/common/primitives';
import { Tabs, TabList, Tab, TabPanel } from '@components/common/Tabs/Tabs';
import { Collapse } from '@components/common/Collapse/Collapse';
import Rating from '@components/catalog/Rating/Rating';
import styles from './ProductPage.module.scss';

export default function ProductPage() {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const product   = useSelector((s) => s.catalog?.currentProduct);
  const isLoading    = useSelector((s) => s.catalog?.isLoading);
  const inWishlist   = useSelector((s) => selectIsInWishlist(s, product?.id));

  const [variant, setVariant] = useState(null);
  const tabsNavRef = useRef(null);
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    dispatch(fetchProduct(slug));
    // Limpiar al desmontar para evitar que currentProduct del slug
    // anterior sea visible brevemente en la siguiente navegación
    return () => dispatch({ type: 'catalog/clearCurrentProduct' });
  }, [dispatch, slug]);
  useEffect(() => {
    if (product?.variants?.length > 0) setVariant(product.variants[0]);
  }, [product]);

  // Mostrar loading si: el fetch está en curso O si el producto
  // del store no corresponde al slug actual (race condition entre
  // renders consecutivos de ProductPage con slugs diferentes)
  if (isLoading || (!product && slug)) {
    return <div className={styles.loading}>Cargando…</div>;
  }
  if (!product) {
    return <Navigate to="/404" replace />;
  }

  const images = product.images || [];
  const effectivePrice = variant?.price_override ?? product.price_with_tax ?? product.base_price;
  const stock = variant?.stock ?? product.stock;
  const isAvailable = stock > 0;
  const related = product.related_products || [];

  const handleAddToCart = async () => {
    try {
      await dispatch(addCartItem({
        product_id: product.id,
        variant_id: variant?.id,
        quantity: qty,
      })).unwrap();
      navigate('/cart');
    } catch {
      // El cartSlice ya despacha el error al store — no se necesita manejo adicional
    }
  };

  return (
    <main className={styles.page}>
      <section className={styles.main}>
        <div className={styles.container}>
          <nav className={styles.breadcrumb}>
            <Link to="/">Inicio</Link><span>/</span>
            <Link to="/catalog">Catálogo</Link><span>/</span>
            {product.category_name && (<><Link to={`/catalog?category=${product.category_slug}`}>{product.category_name}</Link><span>/</span></>)}
            {product.orisha_name && (<><Link to={`/catalog?orishas=${product.orisha_slug}`}>{product.orisha_name}</Link><span>/</span></>)}
            <span className={styles.bcCurrent}>{product.name}</span>
          </nav>

          <div className={styles.layout}>
            {/* Gallery */}
            <div className={styles.gallery}>
              <div className={styles.thumbs}>
                {images.length > 0 ? images.map((img, i) => (
                  <button
                    key={img.url ?? img.id ?? i}
                    type="button"
                    className={`${styles.thumb} ${i === activeImg ? styles.thumbActive : ''}`}
                    onClick={() => setActiveImg(i)}
                  >
                    <img src={img.url} alt="" />
                  </button>
                )) : <div className={styles.thumbPlaceholder} />}
              </div>
              <div className={styles.mainImg}>
                {images[activeImg]
                  ? <img src={images[activeImg].url} alt={product.name} />
                  : <div className={styles.imgPlaceholder}>{product.name}</div>}
              </div>
            </div>

            {/* Info */}
            <div className={styles.info}>
              <div className={styles.tags}>
                {product.category_name && <MetaTag tone="bronze">{product.category_name}</MetaTag>}
                {product.orisha_name && <><span className={styles.tagDot}>·</span><MetaTag tone="coral">{`Para ${product.orisha_name}`}</MetaTag></>}
                <span className={styles.tagDot}>·</span>
                <span className={styles.sku}>SKU · {product.sku}</span>
              </div>

              <h1 className={styles.title}>{product.name}</h1>
              <p className={styles.shortDesc}>{product.short_description}</p>

              <div className={styles.priceRow}>
                <Price amount={effectivePrice} size="xl" showCurrency />
                {product.installments_label && (
                  <span className={styles.installments}>· {product.installments_label}</span>
                )}
              </div>
              <div className={styles.priceFinePrint}>
                IVA INCLUIDO {product.free_shipping && '· ENVÍO GRATIS EN ESTE PEDIDO'}
              </div>

              {/* Variants */}
              {product.variants?.length > 0 && (
                <div className={styles.variants}>
                  <div className={styles.variantsHeader}>
                    <MetaTag>{product.variant_type_name || 'Variante'}</MetaTag>
                    {product.size_chart_url && (
                      <a href={product.size_chart_url} className={styles.sizeGuide}>
                        GUÍA DE TALLAS →
                      </a>
                    )}
                  </div>
                  <div className={styles.variantGrid}>
                    {product.variants.map((v) => {
                      const isActive = variant?.id === v.id;
                      return (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => setVariant(v)}
                          className={`${styles.variantBtn} ${isActive ? styles.variantBtnActive : ''}`}
                        >
                          <div className={styles.variantLabel}>{v.label}</div>
                          {v.sub_label && <div className={styles.variantSub}>{v.sub_label}</div>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* CTA */}
              <div className={styles.cta}>
                <div className={styles.qty}>
                  <button type="button" onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
                  <span>{qty}</span>
                  <button type="button" onClick={() => setQty(qty + 1)}>+</button>
                </div>
                <Button variant="primary" size="lg" onClick={handleAddToCart} disabled={!isAvailable}>
                  {isAvailable ? 'Agregar a la bolsa' : 'Sin stock'}
                </Button>
                <button
                  type="button"
                  className={styles.wishBtn}
                  onClick={() => dispatch(toggleWishlist({ productId: product.id, inWishlist }))}
                >{inWishlist ? '♥' : '♡'}</button>
              </div>

              {/* Availability */}
              <div className={styles.availability}>
                <span className={`${styles.availDot} ${isAvailable ? styles.availDotOk : styles.availDotOut}`} />
                <span>
                  {isAvailable
                    ? <><strong>Disponible</strong> · {stock} {stock === 1 ? 'pieza' : 'piezas'} en bodega</>
                    : 'Agotado · avísame cuando vuelva'}
                </span>
              </div>

              {/* Trust strip */}
              <div className={styles.trust}>
                <div>
                  <MetaTag tone="bronze">Orisha</MetaTag>
                  <div>{product.orisha_name || '—'}</div>
                </div>
                <div>
                  <MetaTag tone="bronze">Uso ritual</MetaTag>
                  <div>{product.ritual_use || '—'}</div>
                </div>
                <div>
                  <MetaTag tone="bronze">Envío</MetaTag>
                  <div>2–4 días en México · DHL</div>
                </div>
                <div>
                  <MetaTag tone="bronze">Devolución</MetaTag>
                  <div>30 días en empaque sellado</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* T-602: Tabs para descripcion / especificaciones (BUG-PP01 corregido) */}
      <section className={styles.descSection} id="product-description">
        <div className={styles.descContainer}>
          <ScrollSpy
            ids={['descripcion', 'ritual', 'specs', 'cuidado']}
            navRef={tabsNavRef}
            rootMargin="0px 0px -30%"
          >
          <Tabs defaultTab="descripcion">
            <TabList ref={tabsNavRef}>
              {product.description && <Tab id="descripcion">Descripción</Tab>}
              {product.ritual_meaning && <Tab id="ritual">Significado Yorùbà</Tab>}
              {product.specifications?.length > 0 && <Tab id="specs">Especificaciones</Tab>}
              {product.care_instructions && <Tab id="cuidado">Cuidado</Tab>}
            </TabList>

            {product.description && (
              <TabPanel tabId="descripcion">
                <div dangerouslySetInnerHTML={{ __html: product.description }} />
              </TabPanel>
            )}

            {product.ritual_meaning && (
              <TabPanel tabId="ritual">
                <div dangerouslySetInnerHTML={{ __html: product.ritual_meaning }} />
              </TabPanel>
            )}

            {product.specifications?.length > 0 && (
              <TabPanel tabId="specs">
                <div className={styles.specs}>
                  {product.specifications.map(([k, v]) => (
                    <div key={k} className={styles.specRow}>
                      <span className={styles.specKey}>{k}</span>
                      <span className={styles.specValue}>{v}</span>
                    </div>
                  ))}
                </div>
              </TabPanel>
            )}

            {/* T-604: Collapse dentro del tab de cuidado */}
            {product.care_instructions && (
              <TabPanel tabId="cuidado">
                <Collapse summary="Instrucciones de cuidado y conservación" open={true}>
                  <div dangerouslySetInnerHTML={{ __html: product.care_instructions }} />
                </Collapse>
              </TabPanel>
            )}
          </Tabs>
          </ScrollSpy>
        </div>
      </section>

      {/* Related */}
      {related.length > 0 && (
        <section className={styles.related}>
          <div className={styles.relatedInner}>
            <header className={styles.relatedHeader}>
              <MetaTag tone="bronze">Acompañan esta pieza</MetaTag>
              <h2 className={styles.relatedTitle}>
                Otros objetos para {product.orisha_name || 'este uso ritual'}
              </h2>
            </header>
            <div className={styles.relatedGrid}>
              {related.slice(0, 4).map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}

function DescBlock({ title, children }) {
  return (
    <div className={styles.descBlock}>
      <h3 className={styles.descBlockTitle}>{title}</h3>
      <div className={styles.descBlockBody}>{children}</div>
    </div>
  );
}
