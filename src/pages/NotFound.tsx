export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="mb-4 font-display text-6xl font-bold text-foreground">404</h1>
        <p className="mb-4 text-lg text-muted-foreground">Страница не найдена</p>
        <a href="/" className="text-primary hover:underline font-medium">
          Вернуться на главную
        </a>
      </div>
    </div>
  );
}
