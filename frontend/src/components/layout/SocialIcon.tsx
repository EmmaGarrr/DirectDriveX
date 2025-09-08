import Link from "next/link";

interface SocialIconProps {
  href: string;
  icon: React.ReactNode;
  onClick?: () => void;
}

export const SocialIcon = ({ href, icon, onClick }: SocialIconProps) => (
  <Link
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    onClick={onClick}
    className="w-10 h-10 flex items-center justify-center bg-bolt-blue rounded-full hover:bg-bolt-mid-blue hover:scale-110 transition-all duration-300"
  >
    {icon}
  </Link>
);

export const WhatsAppIcon = () => (
  <svg
    className="w-5 h-5 text-white"
    fill="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.38 1.25 4.82l-1.34 4.91 5.04-1.32c1.39.77 2.96 1.21 4.58 1.21h.01c5.46 0 9.91-4.45 9.91-9.91s-4.45-9.91-9.91-9.91zM17.23 14.25c-.2-.1-.58-.29-.67-.32-.09-.04-2.2-1.08-2.54-1.2-.34-.12-.58-.18-.83.18-.24.36-.96 1.2-.18 1.45.08.24 1.17.43 1.34.46.17.04.29.03.41-.06.12-.09.51-.59.58-.66.07-.07.15-.01.27.06.12.07.58.28.66.32.09.04.15.06.17.09.02.03 0 .18-.03.21-.03.03-.24.27-.33.36s-.18.1-.36.06c-.18-.04-1.05-.39-2-1.23-.74-.66-1.23-1.48-1.38-1.72-.15-.24-.02-.38.11-.5.12-.11.27-.28.41-.42.14-.14.18-.24.27-.4s.05-.18-.01-.36c-.06-.18-.83-2-.14-2.74-.68-.72-1.38-.62-1.59-.62-.2-.01-.44-.01-.68-.01s-.65.09-.99.44c-.34.36-1.31 1.28-1.31 3.11s1.34 3.61 1.51 3.85c.17.24 2.69 4.11 6.52 5.72.91.38 1.62.6 2.18.77.56.17 1.07.14 1.48.09.46-.06 1.41-1.16 1.61-2.28.2-.12.2-.21.14-.32s-.18-.1-.36-.2z" />
  </svg>
);