import React, { useEffect, useRef } from "react";
import gsap from "gsap";

const Features = () => {
  const featuresRef = useRef(null);

  useEffect(() => {
    gsap.from(featuresRef.current.children, {
      opacity: 0,
      y: 50,
      stagger: 0.2,
      duration: 1,
    });
  }, []);

  return (
    <section className="py-20 bg-gray-900 text-white">
      <div className="container mx-auto text-center" ref={featuresRef}>
        <h2 className="text-4xl font-bold mb-8">Why Choose Us?</h2>
        <div className="grid grid-cols-3 gap-8">
          <div className="p-6 bg-gray-800 rounded-xl shadow-lg">📊 AI-Powered Analysis</div>
          <div className="p-6 bg-gray-800 rounded-xl shadow-lg">⚡ Real-Time Insights</div>
          <div className="p-6 bg-gray-800 rounded-xl shadow-lg">🔒 Secure & Reliable</div>
        </div>
      </div>
    </section>
  );
};

export default Features;
