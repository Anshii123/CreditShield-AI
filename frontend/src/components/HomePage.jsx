import React from 'react';
import { motion } from 'framer-motion';
import { Shield, ArrowRight, Zap, Target, Cpu, CheckCircle } from 'lucide-react';

export default function HomePage({ onNavigateToPredict }) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 100, damping: 18 }
    }
  };

  const featureList = [
    {
      title: "Real-time Risk Profiling",
      desc: "Instant evaluation of loan defaults based on mathematical algorithms and decision bounds.",
      icon: Zap,
      gradient: "from-blue-500/10 to-cyan-500/10 border-blue-500/20"
    },
    {
      title: "Multi-Model Comparison",
      desc: "Simultaneously assesses Logistic Regression, Random Forest, and Gradient Boosting, picking the highest-performing model automatically.",
      icon: Cpu,
      gradient: "from-indigo-500/10 to-purple-500/10 border-indigo-500/20"
    },
    {
      title: "Explainable Credit Decisions",
      desc: "Transparent explanations of risk parameters (DTI bounds, credit ratings, employment terms) to facilitate manual auditing.",
      icon: Target,
      gradient: "from-purple-500/10 to-pink-500/10 border-purple-500/20"
    }
  ];

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-6xl mx-auto px-4 py-12 lg:py-20 flex flex-col items-center text-center space-y-16"
    >
      {/* Hero Section */}
      <div className="space-y-6 max-w-3xl">
        <motion.div 
          variants={itemVariants}
          className="inline-flex items-center gap-2.5 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-xs font-semibold tracking-wider uppercase mb-2 shadow-lg shadow-blue-500/5"
        >
          <Shield className="h-4 w-4" />
          Fintech Risk intelligence
        </motion.div>

        <motion.h1 
          variants={itemVariants}
          className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-tight"
        >
          CreditShield <span className="text-gradient font-black">AI</span>
        </motion.h1>

        <motion.p 
          variants={itemVariants}
          className="text-lg md:text-xl text-slate-400 font-light"
        >
          AI Based Loan Risk Assessment Platform
        </motion.p>

        <motion.p 
          variants={itemVariants}
          className="text-sm md:text-base text-slate-500 max-w-xl mx-auto leading-relaxed font-light"
        >
          Automate default screening and optimize your lending parameters with state-of-the-art machine learning models trained dynamically on your transaction databases.
        </motion.p>

        {/* CTA Button */}
        <motion.div variants={itemVariants} className="pt-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onNavigateToPredict}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-4.5 px-8 rounded-2xl shadow-xl shadow-indigo-500/10 hover:shadow-indigo-500/25 transition-all text-sm group"
          >
            Launch Risk Evaluator
            <ArrowRight className="h-4.5 w-4.5 group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </motion.div>
      </div>

      {/* Features Grid */}
      <motion.div 
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full text-left"
      >
        {featureList.map((feat, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -6, transition: { duration: 0.2 } }}
            className={`glassmorphism rounded-3xl p-8 border bg-gradient-to-tr ${feat.gradient} card-glow-brand flex flex-col justify-between h-64`}
          >
            <div className="space-y-4">
              <div className="p-3 bg-slate-900/60 rounded-2xl w-fit border border-white/5">
                <feat.icon className="h-6 w-6 text-blue-400" />
              </div>
              <h3 className="text-lg font-bold text-white">{feat.title}</h3>
              <p className="text-slate-400 text-xs leading-relaxed font-light">{feat.desc}</p>
            </div>
            
            <div className="flex items-center gap-1 text-[10px] text-blue-400/80 font-medium pt-2">
              <CheckCircle className="h-3.5 w-3.5" />
              Enterprise Grade
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Floating abstract decorative element */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl pointer-events-none -z-10" />
    </motion.div>
  );
}
