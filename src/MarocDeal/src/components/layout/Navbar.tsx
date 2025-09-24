import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useTheme } from '@/components/ui/theme-provider';
import { Search, Menu, X, Sun, Moon, Globe, Smartphone, ChevronDown, LogOut, User, Heart, Home, Star, MapPin } from 'lucide-react';
import { categories, mockProducts, type Product } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';
import { useFavorites } from '@/contexts/FavoritesContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [activeProductIndex, setActiveProductIndex] = useState(-1);
  
  const location = useLocation();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const { favoritesCount } = useFavorites();
  
  // Refs for focus management
  const searchInputRef = useRef<HTMLInputElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const authStatus = localStorage.getItem('isAuthenticated') === 'true';
    setIsAuthenticated(authStatus);
  }, [location]);

  // Filter products based on search query
  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = mockProducts.filter(product =>
        product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5); // Limit to 5 results for dropdown
      setFilteredProducts(filtered);
      setShowResults(filtered.length > 0);
    } else {
      setFilteredProducts([]);
      setShowResults(false);
    }
    setActiveProductIndex(-1);
  }, [searchQuery]);

  // Focus trap for mobile menu
  const focusableElements = useCallback(() => {
    if (!mobileMenuRef.current) return [];
    return Array.from(
      mobileMenuRef.current.querySelectorAll(
        'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
    );
  }, []);

  // Handle escape key to close menus
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showResults) {
          setShowResults(false);
          setActiveProductIndex(-1);
        }
        if (isOpen) {
          setIsOpen(false);
        }
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [showResults, isOpen]);

  // Focus trap for mobile menu
  useEffect(() => {
    if (isOpen) {
      const elements = focusableElements();
      if (elements.length > 0) {
        (elements[0] as HTMLElement).focus();
        
        const handleTabKey = (e: KeyboardEvent) => {
          if (e.key === 'Tab') {
            const firstElement = elements[0] as HTMLElement;
            const lastElement = elements[elements.length - 1] as HTMLElement;
            
            if (e.shiftKey) {
              if (document.activeElement === firstElement) {
                e.preventDefault();
                lastElement.focus();
              }
            } else {
              if (document.activeElement === lastElement) {
                e.preventDefault();
                firstElement.focus();
              }
            }
          }
        };
        
        document.addEventListener('keydown', handleTabKey);
        return () => document.removeEventListener('keydown', handleTabKey);
      }
    }
  }, [isOpen, focusableElements]);

  const navigation = [
    { name: t('nav.home'), href: '/', icon: Home },
    { name: t('nav.favorites'), href: '/favorites', icon: Heart }
  ];

  const languages = [
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'ar', name: 'العربية', flag: '🇲🇦' },
    { code: 'en', name: 'English', flag: '🇺🇸' }
  ];

  // Selected categories (5 items as requested)
  const selectedCategories = categories.slice(0, 5);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    if (lng === 'ar') {
      document.documentElement.dir = 'rtl';
      document.documentElement.lang = 'ar';
    } else {
      document.documentElement.dir = 'ltr';
      document.documentElement.lang = lng;
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('username');
    setIsAuthenticated(false);
    toast({
      title: t('auth.loggedOut'),
      description: t('auth.loggedOutSuccess')
    });
    navigate('/');
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
      setShowResults(false);
    }
  };

  const handleProductClick = (product: Product) => {
    navigate(`/product/${product.id}`);
    setShowResults(false);
    setSearchQuery('');
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (!showResults) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveProductIndex(prev => 
          prev < filteredProducts.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveProductIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (activeProductIndex >= 0) {
          handleProductClick(filteredProducts[activeProductIndex]);
        } else if (searchQuery.trim()) {
          handleSearchSubmit(e);
        }
        break;
    }
  };

  const toggleMobileMenu = () => {
    setIsOpen(!isOpen);
  };
  return (
    <nav className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border sticky top-0 z-50 shadow-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0">
            <Link 
              to="/" 
              className="flex items-center space-x-2 group transition-all duration-200 hover:scale-105"
              aria-label="TechMorocco Home"
            >
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center shadow-card group-hover:shadow-hover transition-all duration-200">
                <Smartphone className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                TechMorocco
              </span>
            </Link>
          </div>

          {/* Center Section - Search Bar & Categories */}
          <div className="hidden md:flex items-center flex-1 max-w-2xl mx-8">
            {/* Search Bar with Autocomplete */}
            <div className="relative flex-1 max-w-lg">
              <form onSubmit={handleSearchSubmit}>
                <div className="relative">
                  <Search 
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-primary w-5 h-5 pointer-events-none" 
                  />
                  <Input
                    variant="search"
                    ref={searchInputRef}
                    type="text"
                    placeholder={t('search.placeholder')}
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onKeyDown={handleSearchKeyDown}
                    className="pl-12"
                    onFocus={() => {
                      // Navigate to Search page using client-side routing
                      navigate('/search');
                      // Show results if there's a query
                      if (searchQuery) setShowResults(true);
                    }}
                    onBlur={() => {
                      // Delay hiding results to allow click events
                      setTimeout(() => setShowResults(false), 200);
                    }}
                    
                    aria-label="Search products"
                    aria-expanded={showResults}
                    aria-haspopup="listbox"
                    role="combobox"
                  />
                </div>
              </form>
              
              {/* Product Search Results */}
              {showResults && filteredProducts.length > 0 && (
                <div 
                  ref={suggestionsRef}
                  className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-md shadow-hover z-50 max-h-80 overflow-y-auto"
                  role="listbox"
                  aria-label="Product search results"
                >
                  {filteredProducts.map((product, index) => (
                    <button
                      key={product.id}
                      onClick={() => handleProductClick(product)}
                      className={`w-full text-left px-4 py-3 hover:bg-accent hover:text-accent-foreground transition-colors duration-150 border-b border-border last:border-b-0 ${
                        index === activeProductIndex ? 'bg-accent text-accent-foreground' : ''
                      }`}
                      role="option"
                      aria-selected={index === activeProductIndex}
                    >
                      <div className="flex items-center space-x-3">
                        <img 
                          src={product.images[0]} 
                          alt={product.title}
                          className="w-12 h-12 object-cover rounded-md flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate">{product.title}</h4>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-sm font-semibold text-primary">
                              {product.price.toLocaleString()} {product.currency}
                            </span>
                            <div className="flex items-center text-xs text-muted-foreground">
                              <MapPin className="w-3 h-3 mr-1" />
                              {product.location.city}
                            </div>
                          </div>
                          <div className="flex items-center mt-1 text-xs text-muted-foreground">
                            <span className="bg-secondary px-2 py-0.5 rounded-full">
                              {product.condition === 'new' ? 'New' : 'Used'}
                            </span>
                            <span className="ml-2">★ {product.seller.rating || 4.5}</span>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                  {filteredProducts.length === 5 && (
                    <div className="px-4 py-2 text-center border-t border-border">
                      <button
                        onClick={() => {
                          navigate(`/search?query=${encodeURIComponent(searchQuery)}`);
                          setShowResults(false);
                        }}
                        className="text-sm text-primary hover:underline"
                      >
                        View all results for "{searchQuery}"
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Categories Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="ml-4 px-3 py-2 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-200 focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  aria-label="Product categories"
                >
                  {t('nav.categories')}
                  <ChevronDown className="w-4 h-4 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="start" 
                className="w-56 bg-popover border-border shadow-hover z-50"
                sideOffset={4}
              >
                {selectedCategories.map((category) => (
                  <DropdownMenuItem key={category.id} asChild>
                    <Link 
                      to={`/categories/${category.id}`} 
                      className="flex items-center space-x-3 px-3 py-2 transition-colors duration-150 hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none"
                    >
                      <span className="text-lg" aria-hidden="true">{category.icon}</span>
                      <span>{t(`categories.${category.id}`)}</span>
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Right Controls */}
          <div className="hidden md:flex items-center space-x-2 flex-shrink-0">
            {/* Navigation Links */}
            <div className="flex items-center space-x-1 mr-4">
              {navigation.map((item) => (
                <Link key={item.name} to={item.href}>
                  <Button 
                    variant={location.pathname === item.href ? "default" : "ghost"} 
                    size="sm" 
                    className="flex items-center gap-2 transition-all duration-200 hover:scale-105 focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    aria-current={location.pathname === item.href ? 'page' : undefined}
                  >
                    {item.href === '/favorites' ? (
                      <div className="relative">
                        <item.icon className="w-4 h-4" />
                        {favoritesCount > 0 && (
                          <Badge 
                            variant="destructive" 
                            className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-xs min-w-4 rounded-full"
                            aria-label={`${favoritesCount} favorites`}
                          >
                            {favoritesCount}
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <item.icon className="w-4 h-4" />
                    )}
                    <span className="hidden lg:inline">{item.name}</span>
                  </Button>
                </Link>
              ))}
            </div>

            {/* Theme Toggle */}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={toggleTheme}
              className="transition-all duration-200 hover:scale-105 focus:ring-2 focus:ring-ring focus:ring-offset-2"
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </Button>

            {/* Language Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="transition-all duration-200 hover:scale-105 focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  aria-label="Select language"
                >
                  <Globe className="w-4 h-4 mr-2" />
                  {languages.find(lang => lang.code === i18n.language)?.flag || '🌍'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="shadow-hover">
                {languages.map((lang) => (
                  <DropdownMenuItem 
                    key={lang.code} 
                    onClick={() => changeLanguage(lang.code)}
                    className="flex items-center space-x-2 transition-colors duration-150 hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                  >
                    <span aria-hidden="true">{lang.flag}</span>
                    <span>{lang.name}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Auth Buttons */}
            {!isAuthenticated ? (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/login')}
                className="flex items-center gap-2 transition-all duration-200 hover:scale-105 focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <User className="w-4 h-4" />
                <span className="hidden lg:inline">{t('auth.login')}</span>
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="flex items-center gap-2 max-w-32 truncate"
                  title={localStorage.getItem('username') || localStorage.getItem('userEmail') || ''}
                >
                  <User className="w-4 h-4 flex-shrink-0" />
                  <span className="hidden lg:inline truncate">
                    {localStorage.getItem('username') || localStorage.getItem('userEmail')}
                  </span>
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleLogout}
                  className="flex items-center gap-2 transition-all duration-200 hover:scale-105 focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  aria-label="Logout"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden lg:inline">{t('auth.logout')}</span>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Controls */}
          <div className="md:hidden flex items-center space-x-2">
            {/* Mobile Search Button */}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/search')}
              className="transition-all duration-200 hover:scale-105 focus:ring-2 focus:ring-ring focus:ring-offset-2"
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
            </Button>

            {/* Mobile Favorites Button with Counter */}
            <Link to="/favorites">
              <Button 
                variant="ghost" 
                size="sm" 
                className="relative transition-all duration-200 hover:scale-105 focus:ring-2 focus:ring-ring focus:ring-offset-2"
                aria-label={`Favorites ${favoritesCount > 0 ? `(${favoritesCount})` : ''}`}
              >
                <Heart className="w-4 h-4" />
                {favoritesCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-xs min-w-4 rounded-full"
                  >
                    {favoritesCount}
                  </Badge>
                )}
              </Button>
            </Link>

            {/* Mobile menu button */}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={toggleMobileMenu}
              className="transition-all duration-200 hover:scale-105 focus:ring-2 focus:ring-ring focus:ring-offset-2"
              aria-label={isOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isOpen}
              aria-controls="mobile-menu"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile slide-over menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-200"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          {/* Slide-over panel */}
          <div 
            ref={mobileMenuRef}
            id="mobile-menu"
            className="fixed inset-y-0 right-0 w-full max-w-sm bg-background border-l border-border shadow-featured z-50 md:hidden animate-in slide-in-from-right duration-300"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation menu"
          >
            <div className="flex flex-col h-full overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-border">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-gradient-primary rounded-lg flex items-center justify-center">
                    <Smartphone className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-lg font-bold bg-gradient-primary bg-clip-text text-transparent">
                    TechMorocco
                  </span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setIsOpen(false)}
                  className="transition-all duration-200"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Navigation Links */}
              <div className="flex-1 px-4 py-6 space-y-4">
                {navigation.map((item) => (
                  <Link 
                    key={item.name} 
                    to={item.href}
                    className={`flex items-center px-3 py-3 rounded-lg text-base font-medium transition-all duration-200 ${
                      location.pathname === item.href 
                        ? 'bg-primary text-primary-foreground shadow-card' 
                        : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                    }`}
                    onClick={() => setIsOpen(false)}
                    aria-current={location.pathname === item.href ? 'page' : undefined}
                  >
                    {item.href === '/favorites' ? (
                      <div className="relative mr-3">
                        <item.icon className="w-5 h-5" />
                        {favoritesCount > 0 && (
                          <Badge 
                            variant="destructive" 
                            className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-xs min-w-4 rounded-full"
                          >
                            {favoritesCount}
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <item.icon className="w-5 h-5 mr-3" />
                    )}
                    {item.name}
                  </Link>
                ))}

                {/* Categories in Mobile Menu */}
                <div className="pt-4 border-t border-border">
                  <h3 className="px-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    {t('nav.categories')}
                  </h3>
                  <div className="space-y-2">
                    {selectedCategories.map((category) => (
                      <Link
                        key={category.id}
                        to={`/categories/${category.id}`}
                        className="flex items-center px-3 py-2 rounded-lg text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-200"
                        onClick={() => setIsOpen(false)}
                      >
                        <span className="text-base mr-3" aria-hidden="true">{category.icon}</span>
                        {t(`categories.${category.id}`)}
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Mobile Search */}
                <div className="pt-4 border-t border-border">
                  <form onSubmit={handleSearchSubmit}>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 pointer-events-none" />
                      <Input
                        type="text"
                        placeholder={t('search.placeholder')}
                        value={searchQuery}
                        onChange={handleSearchChange}
                        className="pl-10 pr-4 w-full"
                        aria-label="Search products"  
                      />
                    </div>
                  </form>
                </div>

                {/* Auth Section */}
                {!isAuthenticated ? (
                  <div className="pt-4 border-t border-border">
                    <Link 
                      to="/login" 
                      className="flex items-center px-3 py-3 rounded-lg text-base font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-200"
                      onClick={() => setIsOpen(false)}
                    >
                      <User className="w-5 h-5 mr-3" />
                      {t('auth.login')}
                    </Link>
                  </div>
                ) : (
                  <div className="pt-4 border-t border-border space-y-2">
                    <div className="flex items-center px-3 py-2 text-base font-medium text-foreground">
                      <User className="w-5 h-5 mr-3" />
                      <span className="truncate">
                        {localStorage.getItem('username') || localStorage.getItem('userEmail')}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsOpen(false);
                      }}
                      className="flex items-center w-full px-3 py-3 rounded-lg text-base font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-200"
                    >
                      <LogOut className="w-5 h-5 mr-3" />
                      {t('auth.logout')}
                    </button>
                  </div>
                )}
              </div>

              {/* Footer Controls */}
              <div className="p-4 border-t border-border">
                <div className="flex items-center justify-between">
                  {/* Language Selector */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="flex items-center gap-2"
                        aria-label="Select language"
                      >
                        <Globe className="w-4 h-4" />
                        {languages.find(lang => lang.code === i18n.language)?.name}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="shadow-hover">
                      {languages.map((lang) => (
                        <DropdownMenuItem 
                          key={lang.code} 
                          onClick={() => changeLanguage(lang.code)}
                          className="flex items-center space-x-2"
                        >
                          <span aria-hidden="true">{lang.flag}</span>
                          <span>{lang.name}</span>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Theme Toggle */}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={toggleTheme}
                    className="flex items-center gap-2"
                    aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                  >
                    {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                    <span>{theme === 'light' ? 'Dark' : 'Light'}</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </nav>
  );
};

export default Navbar;