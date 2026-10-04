import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import './App.css'

type Product = { id: number; name: string; category: string; price: number; stock: number; status: 'Đang bán' | 'Sắp hết' | 'Tạm ẩn'; color: string }
const categories = ['Thiết bị điện tử', 'Thời trang', 'Nhà cửa', 'Sức khỏe', 'Thể thao', 'Văn phòng phẩm']
const colors = ['#dbeafe', '#fce7f3', '#dcfce7', '#fef3c7', '#ede9fe', '#ffedd5']
const products: Product[] = Array.from({ length: 10_000 }, (_, index) => {
  const id = index + 1
  const status = id % 13 === 0 ? 'Sắp hết' : id % 17 === 0 ? 'Tạm ẩn' : 'Đang bán'
  return { id, name: ['Tai nghe không dây', 'Bình giữ nhiệt', 'Đèn bàn thông minh', 'Bàn phím cơ', 'Áo khoác nhẹ', 'Loa Bluetooth'][index % 6], category: categories[index % categories.length], price: 129000 + ((index * 1379) % 2480000), stock: (index * 17) % 183, status, color: colors[index % colors.length] }
})

const money = (price: number) => `${price.toLocaleString('vi-VN')} ₫`
const inventoryValue = products.slice(0, 7500).reduce((sum, product) => sum + product.price, 0)

const ProductRow = memo(function ProductRow({ product, checked, onToggle }: { product: Product; checked: boolean; onToggle: (id: number) => void }) {
  return <div className="virtual-row" role="row">
    <div className="cell check-cell"><input type="checkbox" aria-label={`Chọn ${product.name}`} checked={checked} onChange={() => onToggle(product.id)} /></div>
    <div className="cell"><div className="product-name"><span className="product-thumb" style={{ backgroundColor: product.color }}>▧</span><div><strong>{product.name}</strong><small>Sản phẩm #{product.id.toString().padStart(5, '0')}</small></div></div></div>
    <div className="cell sku">SKU-{(100000 + product.id).toString()}</div><div className="cell">{product.category}</div><div className="cell price">{money(product.price)}</div><div className="cell">{product.stock} <span className="unit">cái</span></div>
    <div className="cell"><span className={`status ${product.status === 'Đang bán' ? 'selling' : product.status === 'Sắp hết' ? 'low' : 'hidden'}`}><i />{product.status}</span></div><div className="cell more">•••</div>
  </div>
})

export default function App() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('Tất cả danh mục')
  const [sort, setSort] = useState('Mới nhất')
  const [selectedIds, setSelectedIds] = useState<Set<number>>(() => new Set())
  const filtered = useMemo(() => {
    if (!query && category === 'Tất cả danh mục' && sort === 'Mới nhất') return [...products].reverse()
    const matching = products.filter((product) => {
      const matchesQuery = !query || `${product.name} ${product.category} ${product.id}`.toLowerCase().includes(query.toLowerCase())
      return matchesQuery && (category === 'Tất cả danh mục' || product.category === category)
    })
    if (sort === 'Mới nhất') return matching.reverse()
    return matching.sort((a, b) => sort === 'Giá thấp đến cao' ? a.price - b.price : b.price - a.price)
  }, [query, category, sort])
  const selectedCountInFilter = useMemo(() => filtered.reduce((count, product) => count + Number(selectedIds.has(product.id)), 0), [filtered, selectedIds])
  const allFilteredSelected = filtered.length > 0 && selectedCountInFilter === filtered.length
  const selectAllRef = useRef<HTMLInputElement>(null)
  useEffect(() => {
    if (selectAllRef.current) selectAllRef.current.indeterminate = selectedCountInFilter > 0 && !allFilteredSelected
  }, [selectedCountInFilter, allFilteredSelected])
  const toggleProduct = useCallback((id: number) => {
    setSelectedIds((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])
  const toggleFilteredProducts = () => {
    setSelectedIds((current) => {
      const next = new Set(current)
      if (allFilteredSelected) filtered.forEach((product) => next.delete(product.id))
      else filtered.forEach((product) => next.add(product.id))
      return next
    })
  }
  const [scrollTop, setScrollTop] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)
  const resetScroll = () => { scrollRef.current?.scrollTo(0, 0); setScrollTop(0) }
  const rowHeight = 57
  const viewportHeight = 570
  const firstVisible = Math.max(0, Math.floor(scrollTop / rowHeight) - 3)
  const lastVisible = Math.min(filtered.length, firstVisible + Math.ceil(viewportHeight / rowHeight) + 7)
  const visibleProducts = filtered.slice(firstVisible, lastVisible)

  return <main className="app-shell">
    <aside className="sidebar"><div className="brand"><span className="brand-mark">M</span><span>market<span className="brand-light">flow</span></span></div><div className="side-label">TỔNG QUAN</div><a className="side-link"><span>◫</span> Bảng điều khiển</a><a className="side-link active"><span>▦</span> Sản phẩm <b>10k</b></a><a className="side-link"><span>♙</span> Khách hàng</a><a className="side-link"><span>▤</span> Đơn hàng</a><div className="side-label second">QUẢN LÝ</div><a className="side-link"><span>◷</span> Báo cáo</a><a className="side-link"><span>⚙</span> Cài đặt</a><div className="sidebar-bottom"><div className="avatar">AL</div><div><strong>Anh Lê</strong><small>Quản trị viên</small></div><span className="dots">•••</span></div></aside>
    <section className="workspace"><header className="topbar"><div className="breadcrumbs">Kho hàng <span>/</span> <strong>Sản phẩm</strong></div><div className="top-actions"><button className="icon-button" aria-label="Thông báo">♧<i /></button><div className="avatar top-avatar">AL</div></div></header>
      <div className="content"><div className="page-heading"><div><div className="eyebrow">KHO HÀNG / DANH MỤC</div><h1>Quản lý sản phẩm</h1><p>Theo dõi và quản lý toàn bộ sản phẩm trong cửa hàng của bạn.</p></div><button className="primary-button">＋ <span>Thêm sản phẩm</span></button></div>
      <div className="stats-grid"><article className="stat-card"><div className="stat-top"><span>Tổng sản phẩm</span><i className="stat-icon indigo">▦</i></div><strong>10.000</strong><div className="stat-note"><b className="up">↗ 12,8%</b> <span>so với tháng trước</span></div></article><article className="stat-card"><div className="stat-top"><span>Giá trị kho hàng</span><i className="stat-icon green">◈</i></div><strong>{money(inventoryValue)}</strong><div className="stat-note"><b className="up">↗ 8,2%</b> <span>so với tháng trước</span></div></article><article className="stat-card"><div className="stat-top"><span>Sắp hết hàng</span><i className="stat-icon amber">◉</i></div><strong>768</strong><div className="stat-note"><b className="warning">Cần nhập thêm</b> <span>trong tuần này</span></div></article><article className="stat-card"><div className="stat-top"><span>Đang kinh doanh</span><i className="stat-icon blue">↗</i></div><strong>9.412</strong><div className="stat-note"><b className="up">94,1%</b> <span>trên tổng số sản phẩm</span></div></article></div>
      <section className="product-panel"><div className="panel-heading"><div><h2>Danh sách sản phẩm</h2><p>Quản lý, tìm kiếm và cập nhật kho hàng.</p></div><button className="outline-button">⇩ <span>Xuất dữ liệu</span></button></div><div className="toolbar"><label className="search-box"><span>⌕</span><input placeholder="Tìm theo tên, mã sản phẩm..." value={query} onChange={(e) => { setQuery(e.target.value); resetScroll() }} /></label><select value={category} onChange={(e) => { setCategory(e.target.value); resetScroll() }}><option>Tất cả danh mục</option>{categories.map((item) => <option key={item}>{item}</option>)}</select><select value={sort} onChange={(e) => { setSort(e.target.value); resetScroll() }}><option>Mới nhất</option><option>Giá thấp đến cao</option><option>Giá cao đến thấp</option></select><button className="filter-button">☷ <span>Bộ lọc</span></button></div>
        <div className="virtual-table" role="table" aria-label="Danh sách sản phẩm"><div className="virtual-header" role="row"><div className="cell check-cell"><input ref={selectAllRef} type="checkbox" aria-label="Chọn tất cả sản phẩm đang hiển thị" checked={allFilteredSelected} onChange={toggleFilteredProducts} /></div><div className="cell">SẢN PHẨM</div><div className="cell">MÃ SKU</div><div className="cell">DANH MỤC</div><div className="cell">GIÁ BÁN</div><div className="cell">TỒN KHO</div><div className="cell">TRẠNG THÁI</div><div className="cell" /></div><div ref={scrollRef} className="virtual-viewport" style={{ height: viewportHeight }} onScroll={(event) => setScrollTop(event.currentTarget.scrollTop)}><div className="virtual-spacer" style={{ height: filtered.length * rowHeight }}><div className="virtual-window" style={{ transform: `translateY(${firstVisible * rowHeight}px)` }}>{visibleProducts.map((product) => <ProductRow key={product.id} product={product} checked={selectedIds.has(product.id)} onToggle={toggleProduct} />)}</div></div>{filtered.length === 0 && <div className="empty-state">Không tìm thấy sản phẩm phù hợp.</div>}</div></div>
        <footer className="table-footer"><span>{selectedIds.size > 0 && <><strong>Đã chọn {selectedIds.size.toLocaleString('vi-VN')}</strong> · </>}Hiển thị <strong>{filtered.length ? `${firstVisible + 1}–${lastVisible}` : '0'}</strong> trong <strong>{filtered.length.toLocaleString('vi-VN')}</strong> sản phẩm</span><span className="scroll-hint">Cuộn để xem thêm</span></footer>
      </section><div className="bottom-note">Dữ liệu được cập nhật lần cuối lúc 09:42 hôm nay <span>•</span> Tất cả thay đổi đã được lưu</div></div>
    </section>
  </main>
}
