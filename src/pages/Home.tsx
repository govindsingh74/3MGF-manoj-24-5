import React from 'react';
import Hero from '../components/Hero';
import Stats from '../components/home/Stats';
import SolanaTechnology from '../components/home/SolanaTechnology';
import DigitalAssets from '../components/home/DigitalAssets';
import Testimonials from '../components/home/Testimonials';

const Home: React.FC = () => {
  return (
    <div>
      <Hero />
      <Stats />
      <SolanaTechnology />
      <DigitalAssets />
      <Testimonials />
    </div>
  );
};

export default Home;