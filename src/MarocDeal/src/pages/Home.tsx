import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import ProductCard from '@/components/common/ProductCard';
import { ReviewsSection } from '@/components/common/ReviewsSection';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import { TrendingUp, LogIn, Search } from 'lucide-react';
import { mockProducts } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';
import HeroCarousel from '@/components/common/HeroCarousel';
import Autoplay from 'embla-carousel-autoplay';
import avitoLogo from '@/assets/avito-logo.png';
import marjaneLogo from '@/assets/marjane-logo.png';
import jumiaLogo from '@/assets/jumia-logo.png';
const Home = () => {
  const {
    t
  } = useTranslation();
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const featuredProducts = mockProducts.slice(0, 8);

  // Authentication state management
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUserName, setCurrentUserName] = useState('');
  useEffect(() => {
    // Check localStorage for authentication status
    const userData = localStorage.getItem('userData');
    if (userData) {
      const user = JSON.parse(userData);
      setIsLoggedIn(true);
      setCurrentUserName(user.username || user.email || 'User');
    }
  }, []);

  // Handle authentication requirement
  const handleRequireAuth = (action: 'login' | 'register') => {
    if (action === 'login') {
      navigate('/login');
    } else {
      navigate('/signup');
    }
  };

  // Handle review submission
  const handleSubmitReview = (review: any) => {
    console.log('Review submitted:', review);
    toast({
      title: t('reviews.reviewSubmitted'),
      description: t('reviews.reviewThankYou')
    });
    return Promise.resolve();
  };
  return <div className="min-h-screen bg-background">
      {/* Hero Carousel Section */}
      <HeroCarousel />

      {/* Partners Section */}
      


      {/* Featured Products */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-2">
                {t('home.featuredProducts')}
              </h2>
              <div className="flex items-center text-muted-foreground">
                <TrendingUp className="w-5 h-5 mr-2" />
                <span>Best deals this week</span>
              </div>
            </div>
            <Button variant="outline" asChild>
              <Link to="/search">
                {t('home.viewAll')}
              </Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map(product => <ProductCard key={product.id} product={product} featured={true} />)}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-primary mb-2">10K+</div>
              <div className="text-muted-foreground">Products</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">50+</div>
              <div className="text-muted-foreground">Retailers</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">1M+</div>
              <div className="text-muted-foreground">Price Comparisons</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">24/7</div>
              <div className="text-muted-foreground">Price Monitoring</div>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <ReviewsSection isLoggedIn={isLoggedIn} currentUserName={currentUserName} onRequireAuth={handleRequireAuth} onSubmitReview={handleSubmitReview} allowAssistantRate={true} />
    </div>;
};
export default Home;