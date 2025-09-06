export default function BackgroundEffects() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* 原有背景装饰 */}
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-400/20 to-pink-400/20 rounded-full blur-3xl"></div>
      
      {/* 高级粒子特效 */}
      <div className="particles-container">
        {/* 大粒子层 */}
        <div className="particle large-particle particle-1" data-x="10" data-y="20"></div>
        <div className="particle large-particle particle-2" data-x="80" data-y="30"></div>
        <div className="particle large-particle particle-3" data-x="20" data-y="60"></div>
        <div className="particle large-particle particle-4" data-x="70" data-y="70"></div>
        <div className="particle large-particle particle-5" data-x="50" data-y="40"></div>
        
        {/* 中粒子层 */}
        <div className="particle medium-particle particle-6" data-x="15" data-y="60"></div>
        <div className="particle medium-particle particle-7" data-x="60" data-y="15"></div>
        <div className="particle medium-particle particle-8" data-x="80" data-y="80"></div>
        <div className="particle medium-particle particle-9" data-x="30" data-y="25"></div>
        <div className="particle medium-particle particle-10" data-x="85" data-y="55"></div>
        
        {/* 小粒子层 */}
        <div className="particle small-particle particle-11" data-x="25" data-y="40"></div>
        <div className="particle small-particle particle-12" data-x="75" data-y="45"></div>
        <div className="particle small-particle particle-13" data-x="40" data-y="75"></div>
        <div className="particle small-particle particle-14" data-x="90" data-y="20"></div>
        <div className="particle small-particle particle-15" data-x="5" data-y="85"></div>
        
        {/* 气泡层 */}
        <div className="bubbles-container">
          <div className="bubble bubble-1"></div>
          <div className="bubble bubble-2"></div>
          <div className="bubble bubble-3"></div>
          <div className="bubble bubble-4"></div>
          <div className="bubble bubble-5"></div>
          <div className="bubble bubble-6"></div>
          <div className="bubble bubble-7"></div>
          <div className="bubble bubble-8"></div>
          <div className="bubble bubble-9"></div>
          <div className="bubble bubble-10"></div>
          <div className="bubble bubble-11"></div>
          <div className="bubble bubble-12"></div>
          <div className="bubble bubble-13"></div>
          <div className="bubble bubble-14"></div>
          <div className="bubble bubble-15"></div>
        </div>
        
        {/* 光效层 */}
        <div className="glow-effects">
          <div className="glow-effect glow-1"></div>
          <div className="glow-effect glow-2"></div>
          <div className="glow-effect glow-3"></div>
          <div className="glow-effect glow-4"></div>
        </div>
      </div>
    </div>
  )
}
