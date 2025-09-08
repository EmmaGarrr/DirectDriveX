"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { CloudUpload, User as UserIcon, LogOut, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { authService, User } from "@/services/authService";
import { toastService } from "@/services/toastService";

export function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [displayName, setDisplayName] = useState("User");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Enhanced display name logic matching Angular
  const updateUserDisplay = (user: User) => {
    let fullName = '';
    
    // Priority order: name > email username
    if (user.name) {
      fullName = user.name;
    } else if (user.email) {
      fullName = user.email.split('@')[0];
    }
    
    // Truncate if too long (max 8 characters for UI)
    const name = fullName.trim();
    setDisplayName(name.length > 8 ? `${name.substring(0, 8)}...` : name || 'User');
  };
  
  const checkAuthState = async () => {
    const authenticated = authService.isAuthenticated();
    setIsLoggedIn(authenticated);
    
    if (authenticated) {
      const user = authService.getCurrentUser();
      setCurrentUser(user);
      
      if (!user) {
        // If no user data, try to load it
        try {
          const userData = await authService.loadUserProfile();
          setCurrentUser(userData);
          updateUserDisplay(userData);
        } catch (error) {
          // If loading fails, logout
          authService.logout();
          setIsLoggedIn(false);
          setCurrentUser(null);
          setDisplayName('User');
        }
      } else {
        updateUserDisplay(user);
      }
    } else {
      setCurrentUser(null);
      setDisplayName('User');
    }
  };
  
  useEffect(() => {
    checkAuthState();

    window.addEventListener("storage", checkAuthState);
    window.addEventListener("focus", checkAuthState);

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("storage", checkAuthState);
      window.removeEventListener("focus", checkAuthState);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    if (isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  }, [pathname]);

  const handleLogout = () => {
    try {
      authService.logout();
      setIsLoggedIn(false);
      setCurrentUser(null);
      setDisplayName('User');
      setIsMobileMenuOpen(false);
      
      toastService.success('Logged out successfully', 2500);
      router.push('/');
    } catch (error) {
      toastService.error('Logout failed. Please try again.', 2500);
    }
  };

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const AuthButtons = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div
      className={cn(
        "flex items-center",
        isMobile
          ? "flex-col w-full space-y-3"
          : "space-x-3"
      )}
    >
      {isLoggedIn ? (
        <>
          <Link
            href="/profile"
            onClick={closeMobileMenu}
            className={cn(
              "flex items-center justify-center space-x-2 bg-bolt-blue text-white rounded-xl hover:bg-bolt-mid-blue shadow-sm transition-all duration-300 hover:scale-105",
              isMobile ? "w-full h-[56px]" : "w-[140px] h-[44px]"
            )}
          >
            <div className="flex items-center justify-center rounded-full bg-white/20 w-7 h-7">
              <UserIcon className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-semibold truncate">{displayName}</span>
          </Link>
          <button
            onClick={handleLogout}
            className={cn(
              "flex items-center justify-center space-x-2 bg-red-600 text-white rounded-xl hover:bg-red-700 shadow-sm transition-all duration-300 hover:scale-105",
              isMobile ? "w-full h-[56px]" : "w-[140px] h-[44px]"
            )}
          >
            <LogOut className="w-4 h-4 text-white" />
            <span className="text-sm font-semibold">Logout</span>
          </button>
        </>
      ) : (
        <>
          <Link
            href="/login"
            onClick={closeMobileMenu}
            className={cn(
              "flex items-center justify-center bg-gray-100 text-gray-700 hover:bg-gray-200 font-semibold rounded-xl transition-all duration-300",
              isMobile ? "w-full h-[56px]" : "w-[120px] h-[44px]"
            )}
          >
            Login
          </Link>
          <Link
            href="/register"
            onClick={closeMobileMenu}
            className={cn(
              "flex items-center justify-center bg-gradient-to-r from-bolt-blue to-bolt-mid-blue text-white font-bold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg",
               isMobile ? "w-full h-[56px] text-lg" : "h-[44px] px-6 text-sm"
            )}
          >
            Start Free
          </Link>
        </>
      )}
    </div>
  );

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 transition-all duration-300 backdrop-blur-xl bg-white border-b border-gray-300",
          isScrolled
            ? "shadow-lg border-b border-slate-200/80"
            : "border-b"
        )}
      >
        <div className="container px-4 mx-auto">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 shadow-lg bg-bolt-blue rounded-xl">
                <CloudUpload className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold text-transparent bg-gradient-to-r from-bolt-black to-bolt-medium-black bg-clip-text">
                Mfcnextgen
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="items-center hidden space-x-8 lg:flex">
              <Link
                href="/how-it-works"
                className="relative text-sm font-medium transition-colors duration-300 group text-bolt-medium-black hover:text-bolt-blue"
              >
                How it Works
                <span className="absolute bottom-[-4px] left-0 h-0.5 w-0 bg-gradient-to-r from-bolt-blue to-bolt-purple transition-all duration-300 group-hover:w-full"></span>
              </Link>
            </nav>

            {/* Desktop Auth Buttons */}
            <div className="hidden lg:flex">
              <AuthButtons />
            </div>

            {/* Mobile Menu Toggle */}
            <div className="lg:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-100"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6 text-gray-700" />
                ) : (
                  <Menu className="w-6 h-6 text-gray-700" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 pt-20 overflow-y-auto bg-white lg:hidden animate-fade-in-down">
          <div className="container flex flex-col h-full px-4 mx-auto">
            <nav className="flex-grow">
              <Link
                href="/how-it-works"
                onClick={closeMobileMenu}
                className="flex items-center justify-between w-full px-4 py-4 text-lg font-medium text-gray-700 transition-colors rounded-lg hover:bg-gray-50 hover:text-bolt-blue"
              >
                <span>How it Works</span>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </Link>
            </nav>
            <div className="pb-8 mt-auto">
              <AuthButtons isMobile />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Simple ChevronRight icon for mobile menu
const ChevronRight = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="m9 18 6-6-6-6" />
  </svg>
);