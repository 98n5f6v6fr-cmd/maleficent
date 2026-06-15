

export default function Footer() {
  return (
    <footer className="border-t border-[rgba(0,0,0,0.05)] mt-24" style={{ backgroundColor: "#FFF8E8" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 flex-shrink-0">
                <div
                  className="w-full h-full bg-contain bg-center bg-no-repeat"
                  style={{ backgroundImage: "url('/hero-image.png')" }}
                />
              </div>
              <span className="font-semibold text-lg text-[#171717]">Maleficent</span>
            </div>
            <p className="text-[#2C2C2C] text-sm leading-relaxed max-w-md">
              Сервис оформления заявок на коллекционные ёлочные игрушки. 
              Без риска пропустить старт продаж.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-sm text-[#171717] mb-3">Навигация</h4>
            <div className="flex flex-col gap-2">
              <FooterLink href="/#preorder">Предзапись</FooterLink>
              <FooterLink href="/#shop">Продажа</FooterLink>
              <FooterLink href="/help">Помощь</FooterLink>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-sm text-[#171717] mb-3">Аккаунт</h4>
            <div className="flex flex-col gap-2">
              <FooterLink href="/login">Вход</FooterLink>
              <FooterLink href="/register">Регистрация</FooterLink>
              <FooterLink href="/dashboard">Личный кабинет</FooterLink>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-[rgba(0,0,0,0.05)] flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-[#2C2C2C]/60">
            © 2026 Maleficent. Все права защищены.
          </p>
          <p className="text-sm text-[#2C2C2C]/60">
            Premium collectible service
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="text-sm text-[#2C2C2C]/70 hover:text-[#171717] transition-colors duration-300"
    >
      {children}
    </a>
  );
}
