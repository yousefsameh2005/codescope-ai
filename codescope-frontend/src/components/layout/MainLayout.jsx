import Header from "./Header";

export default function MainLayout({ children, onRefresh, onAddRepository }) {
  return (
    <div className="app-shell">
      <Header onRefresh={onRefresh} onAddRepository={onAddRepository} />
      {children}
    </div>
  );
}