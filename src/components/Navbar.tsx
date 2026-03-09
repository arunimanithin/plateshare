import React from 'react';
import { User, Page } from '../types';
import {
  Search,
  List,
  PlusCircle,
  LogOut,
  LogIn,
  UserPlus,
  Menu,
  X,
  ChefHat,
  ShieldCheck,
  PackageOpen,
} from 'lucide-react';

interface NavbarProps {
  currentUser: User | null;
  currentPage: Page;
  onNavigate: (page: Page) => void;
  onLoginClick: () => void;
  onSignupClick: () => void;
  onLogout: () => void;
}

export default function Navbar({
  currentUser,
  currentPage,
  onNavigate,
  onLoginClick,
  onSignupClick,
  onLogout,
}: NavbarProps) {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const navLinks: { label: string; page: Page; icon: React.ReactNode; roles?: string[] }[] = [
    { label: 'Browse', page: 'browse', icon: <Search size={16} /> },
    { label: 'My Listings', page: 'my-listings', icon: <List size={16} />, roles: ['donor'] },
    { label: 'Post Food', page: 'post-food', icon: <PlusCircle size={16} />, roles: ['donor'] },
    { label: 'My Claims', page: 'my-claims', icon: <PackageOpen size={16} />, roles: ['recipient'] },
    { label: 'Admin', page: 'admin', icon: <ShieldCheck size={16} />, roles: ['admin'] },
  ];

  const visibleLinks = navLinks.filter(
    l => !l.roles || (currentUser && l.roles.includes(currentUser.role))
  );

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(w => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-700';
      case 'donor': return 'bg-emerald-100 text-emerald-700';
      case 'recipient': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="bg-gradient-to-br from-primary-500 to-primary-700 text-white p-2 rounded-xl">
              <ChefHat size={22} />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
              PlateShare
            </span>
          </button>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-1">
            {visibleLinks.map(link => (
              <button
                key={link.page}
                onClick={() => onNavigate(link.page)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  currentPage === link.page
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {link.icon}
                {link.label}
              </button>
            ))}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3">
            {currentUser ? (
              <>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-bold">
                    {getInitials(currentUser.full_name)}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-gray-800 leading-tight">
                      {currentUser.full_name}
                    </span>
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full w-fit ${getRoleBadgeColor(currentUser.role)}`}>
                      {currentUser.role}
                    </span>
                  </div>
                </div>
                <button
                  onClick={onLogout}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={onLoginClick}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <LogIn size={16} />
                  Login
                </button>
                <button
                  onClick={onSignupClick}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 rounded-lg transition-all shadow-sm"
                >
                  <UserPlus size={16} />
                  Sign Up
                </button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-50"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 animate-slideDown">
          <div className="px-4 py-3 space-y-1">
            {visibleLinks.map(link => (
              <button
                key={link.page}
                onClick={() => {
                  onNavigate(link.page);
                  setMobileOpen(false);
                }}
                className={`flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm font-medium ${
                  currentPage === link.page
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {link.icon}
                {link.label}
              </button>
            ))}
            <div className="border-t border-gray-100 pt-2 mt-2">
              {currentUser ? (
                <>
                  <div className="flex items-center gap-2 px-3 py-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-bold">
                      {getInitials(currentUser.full_name)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{currentUser.full_name}</p>
                      <p className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full w-fit ${getRoleBadgeColor(currentUser.role)}`}>
                        {currentUser.role}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      onLogout();
                      setMobileOpen(false);
                    }}
                    className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      onLoginClick();
                      setMobileOpen(false);
                    }}
                    className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    <LogIn size={16} />
                    Login
                  </button>
                  <button
                    onClick={() => {
                      onSignupClick();
                      setMobileOpen(false);
                    }}
                    className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-white bg-primary-500 hover:bg-primary-600"
                  >
                    <UserPlus size={16} />
                    Sign Up
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
