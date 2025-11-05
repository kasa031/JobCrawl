import { motion } from 'framer-motion';

function About() {
  return (
    <div className="max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-lg shadow-md p-8"
      >
        <h1 className="text-3xl font-bold text-dark-heading mb-6">Om meg</h1>
        
        <div className="space-y-6 text-dark-text">
          <p className="text-lg leading-relaxed">
            Hei! Jeg er en 38 år gammel jente fra Hauketo i Oslo, som bor på Bislett med mannen min og våre to barn på ni og ti år.
          </p>
          
          <div className="bg-mocca-50 rounded-lg p-6 border border-mocca-200">
            <h2 className="text-xl font-semibold text-dark-heading mb-4">Kontakt</h2>
            <p className="text-dark-text">
              Har du spørsmål eller trenger hjelp? Ta gjerne kontakt!
            </p>
            <div className="mt-4">
              <a 
                href="mailto:ms.tery@icloud.com"
                className="text-mocca-600 hover:text-mocca-700 font-semibold underline transition-colors"
              >
                ms.tery@icloud.com
              </a>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default About;

