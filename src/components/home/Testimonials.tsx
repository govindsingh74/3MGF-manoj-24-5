import React from 'react';
import { Star } from 'lucide-react';

const Testimonials: React.FC = () => {
  const testimonials = [
    {
      name: 'Alex Thompson',
      role: 'Crypto Investor',
      content: 'MGF has revolutionized how I think about memecoins. The technology and community are unmatched.',
      rating: 5,
      image: 'https://images.pexels.com/photos/2269872/pexels-photo-2269872.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
    },
    {
      name: 'Sarah Chen',
      role: 'DeFi Developer',
      content: 'The technical infrastructure behind MGF is impressive. It\'s not just another memecoin.',
      rating: 5,
      image: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
    },
    {
      name: 'Michael Roberts',
      role: 'Community Member',
      content: 'Being part of the MGF community has been an amazing journey. The support and engagement are incredible.',
      rating: 5,
      image: 'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
    }
  ];

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-display mb-6">Community Feedback</h2>
          <p className="text-text-secondary max-w-2xl mx-auto">
            Hear what our community members have to say about their experience with MGF
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="holographic p-6 transform hover:scale-105 transition-all duration-300"
            >
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <h3 className="font-display">{testimonial.name}</h3>
                  <p className="text-text-secondary text-sm">{testimonial.role}</p>
                </div>
              </div>
              
              <div className="flex mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 text-accent-purple fill-accent-purple"
                  />
                ))}
              </div>
              
              <p className="text-text-secondary">{testimonial.content}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;