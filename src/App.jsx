import React, { useState, useEffect, useRef } from 'react'
import {
  Play,
  Pause,
  RefreshCcw,
  Terminal,
  Volume2,
  Mic,
  ChevronRight,
  ArrowLeft,
  Home,
} from 'lucide-react'

// --- CONFIGURACIÓN DE DATOS ---
const presentationData = [
  {
    id: 1,
    speaker: 'right',
    name: 'Nataniel',
    role: 'Analista Pedagógico',
    title: '1 - Introducción al trabajo',
    text: 'En la introducción del informe se explica que el objetivo general del trabajo fue “revisar cómo distintas universidades latinoamericanas utilizan Moodle en sus propuestas formativas y, a partir de ese diagnóstico, diseñar una propuesta de intervención centrada en la integración pedagógica de herramientas de Inteligencia Artificial”. Estas ideas introducen el sentido del análisis comparativo y la necesidad de un enfoque crítico aplicado.',
    imageContent: '/pantalla_1.png',
    duration: 75000, // 35 segundos
    audioUrl: '/pantalla_1.mp3',
  },
  {
    id: 2,
    speaker: 'left',
    name: 'Martín',
    role: 'Investigador UNJu',
    title: '2 - Diagnóstico UNJu vs UNAM',
    text: 'La UNJu “trabaja varios aspectos que se alinean con un enfoque dialógico”, como los foros y las tareas basadas en la realidad del estudiante. La UNAM presenta “actividades mecánicas y de evaluación cerrada” dentro de un diseño secuencial SCORM, lo que “responde a un modelo transmisivo”. La comparación evidencia cómo la misma plataforma puede sostener pedagogías totalmente diferentes.',
    imageContent: '/pantalla_2.png',
    duration: 82000,
    audioUrl: '/pantalla_2.mp3',
  },
  {
    id: 3,
    speaker: 'right',
    name: 'Nataniel',
    role: 'Analista Pedagógico',
    title: '3 - Uso real de IA',
    text: 'La UNJu “ya está trabajando con IA y herramientas versátiles”, especialmente H5P, capacitaciones y el asistente virtual Huma. La UNAM “ha asumido un rol de producción tecnológica”, creando el “Asistente IA para docentes”, que conecta APIs de modelos de lenguaje y genera estructuras de cursos exportables a Moodle. Estas diferencias muestran cómo cada universidad enfrenta la escala y sus necesidades pedagógicas.',
    imageContent: '/pantalla_3.png',
    duration: 85000,
    audioUrl: '/pantalla_3.mp3',
  },
  {
    id: 4,
    speaker: 'left',
    name: 'Martín',
    role: 'Investigador UNJu',
    title: '4 - El desafío de Aprendo+',
    text: 'El desafío principal fue: “La falta de diálogo y la predominancia de actividades individuales sin construcción social del conocimiento.” El diagnóstico mostró que aunque la plataforma funciona técnicamente, no promueve interacción significativa ni procesos dialógicos.',
    imageContent: '/pantalla_4.png',
    duration: 74000,
    audioUrl: '/pantalla_4.mp3',
  },
  {
    id: 5,
    speaker: 'right',
    name: 'Nataniel',
    role: 'Analista Pedagógico',
    title: '5 - Módulo de intervención 5.0',
    text: 'Semana 1: reflexión personal sobre huellas digitales usando Gemini. Semana 2: producción colaborativa de un glosario crítico. Semana 3: análisis crítico con NotebookLM sin delegar la reflexión en la IA. Semana 4: producción conjunta con Canva Docs integrando todo el recorrido. El módulo transforma la experiencia desde actividades automáticas hacia una práctica crítica, social y participativa.',
    imageContent: '/pantalla_5.png',
    duration: 114000,
    audioUrl: '/pantalla_5.mp3',
  },
  {
    id: 6,
    speaker: 'left',
    name: 'Martín',
    role: 'Investigador UNJu',
    title: '6 - Reflexión ética y cierre',
    text: 'La IA debe evitar “reforzar prácticas transmisivas” si se usa sin reflexión. Se debe atender la “privacidad de datos”, evitando casos reales sensibles. El rol docente sigue siendo central para guiar y evitar la pasividad. La equidad tecnológica fue considerada al elegir herramientas gratuitas y accesibles.',
    imageContent: '/pantalla_6.png',
    duration: 60000,
    audioUrl: '/pantalla_6.mp3',
  },
]

const avatars = {
  left: 'Martin.png', // Martín
  right: '/Yo_Actualizado.jpg', // Nataniel
}

const App = () => {
  const [started, setStarted] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [progress, setProgress] = useState(0)
  const [finishedSlide, setFinishedSlide] = useState(false)

  const audioRef = useRef(null)

  const currentData = presentationData[currentSlide]
  const isFinished = currentSlide >= presentationData.length

  // --- LÓGICA DE TEMPORIZADOR Y AUDIO ---
  useEffect(() => {
    if (!started || isFinished) return

    let timer

    // 1. Lógica de temporizador manual (SOLO si NO hay audioUrl)
    // Esto sirve de respaldo para diapositivas sin audio
    if (!currentData.audioUrl && isPlaying && !isPaused && !finishedSlide) {
      const duration = currentData.duration || 5000 // Default 5s
      const intervalTime = 100
      const stepValue = (intervalTime / duration) * 100

      timer = setInterval(() => {
        setProgress((prev) => {
          const next = prev + stepValue
          if (next >= 100) {
            clearInterval(timer)
            setIsPlaying(false)
            setFinishedSlide(true)
            return 100
          }
          return next
        })
      }, intervalTime)
    }

    // 2. Manejo del Audio Real (Play/Pause)
    if (audioRef.current) {
      if (isPaused || !isPlaying) {
        audioRef.current.pause()
      } else if (isPlaying && currentData.audioUrl) {
        // El play se dispara, pero el progreso ahora lo maneja "onTimeUpdate" abajo
        const playPromise = audioRef.current.play()
        if (playPromise !== undefined) {
          playPromise.catch((err) =>
            console.log('Error reproduciendo audio:', err)
          )
        }
      }
    }

    return () => {
      if (timer) clearInterval(timer)
    }
  }, [started, isFinished, isPlaying, isPaused, finishedSlide, currentData])

  // --- CONTROLADORES DE EVENTOS ---

  // Nuevo: Actualiza la barra de progreso basado en el tiempo real del audio
  const handleAudioUpdate = (e) => {
    const audio = e.currentTarget
    if (audio.duration > 0) {
      const percent = (audio.currentTime / audio.duration) * 100
      setProgress(percent)
    }
  }

  const resetSlideState = () => {
    setIsPlaying(true)
    setIsPaused(false)
    setFinishedSlide(false)
    setProgress(0)

    // Reiniciar el elemento de audio HTML
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
  }

  const handleStart = () => {
    setStarted(true)
    resetSlideState()
  }

  const handleNext = () => {
    if (currentSlide < presentationData.length) {
      setCurrentSlide((prev) => prev + 1)
      resetSlideState()
    }
  }

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide((prev) => prev - 1)
      resetSlideState()
    }
  }

  const togglePause = () => {
    setIsPaused(!isPaused)
  }

  const handleRestart = () => {
    setStarted(false)
    setCurrentSlide(0)
    resetSlideState()
    setIsPlaying(false)
  }

  // --- VISTAS ---

  // Pantalla de Inicio
  if (!started) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-200 font-mono flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-slate-800 rounded-xl shadow-2xl overflow-hidden border border-cyan-500/30">
          <div className="bg-slate-950 p-3 border-b border-slate-700 flex items-center justify-between">
            <span className="ml-2 text-xs text-slate-400">
              moodle_analysis_module_v2.exe
            </span>
          </div>
          <div className="p-12 text-center flex flex-col items-center gap-6">
            <div className="w-24 h-24 bg-cyan-500/10 rounded-full flex items-center justify-center animate-pulse">
              <Terminal
                size={48}
                className="text-cyan-400"
              />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
              Reflexiones en torno a Moodle
            </h1>
            <h2 className="text-xl text-slate-300">
              Perspectiva Pedagógica Contextualizada
            </h2>
            <p className="text-slate-400 max-w-md text-sm italic mt-2">
              Debate interactivo entre Martín y Nataniel
            </p>
            <button
              onClick={handleStart}
              className="group relative px-8 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg transition-all duration-300 shadow-[0_0_20px_rgba(8,145,178,0.3)] hover:shadow-[0_0_30px_rgba(8,145,178,0.5)] mt-4"
            >
              <span className="flex items-center gap-2">
                COMENZAR DEBATE{' '}
                <Play
                  size={18}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Pantalla Final
  if (isFinished) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-200 font-mono flex items-center justify-center p-4">
        <div className="text-center animate-fade-in max-w-2xl">
          <h2 className="text-3xl font-bold text-cyan-400 mb-4">
            Fin de la Presentación
          </h2>
          <p className="text-slate-400 mb-8 text-lg">
            "La IA puede ser un apoyo, pero la construcción del conocimiento
            tiene que seguir siendo humana, colectiva y situada."
          </p>
          <button
            onClick={handleRestart}
            className="px-8 py-3 bg-slate-800 border border-cyan-500 text-cyan-400 rounded hover:bg-cyan-950 transition-colors flex items-center gap-2 mx-auto shadow-lg"
          >
            <RefreshCcw size={18} /> Volver al Inicio
          </button>
        </div>
      </div>
    )
  }

  // Pantalla Principal (Debate)
  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-mono flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-slate-950 border-b border-cyan-900/50 p-4 flex justify-between items-center shadow-lg z-10">
        <div className="flex items-center gap-3">
          <Terminal
            size={20}
            className="text-cyan-500"
          />
          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-wider text-cyan-100">
              MOODLE_CONTEXT.JS
            </span>
            <span className="text-[10px] text-slate-500">UNJu vs UNAM</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={handleRestart}
            className="flex items-center gap-2 text-xs text-slate-400 hover:text-cyan-400 transition-colors border border-slate-700 px-2 py-1 rounded hover:border-cyan-500/50"
            title="Volver al inicio"
          >
            <Home size={14} /> <span className="hidden sm:inline">INICIO</span>
          </button>
          <div className="w-px h-4 bg-slate-700"></div>
          <div
            className="flex items-center gap-2 px-3 py-1 bg-slate-900 rounded-full border border-slate-700 transition-colors duration-300"
            style={{
              borderColor: isPlaying && !isPaused ? '#22c55e' : '#64748b',
            }}
          >
            {isPlaying && !isPaused ? (
              <Volume2
                size={14}
                className="text-green-400 animate-pulse"
              />
            ) : (
              <Volume2
                size={14}
                className="text-slate-500"
              />
            )}
            <span className="text-xs text-slate-400 hidden sm:inline">
              {isPaused ? 'PAUSADO' : isPlaying ? 'HABLANDO' : 'ESPERANDO'}
            </span>
          </div>
          <div className="text-xs text-slate-500">
            SLIDE {currentSlide + 1} / {presentationData.length}
          </div>
        </div>
      </header>

      {/* Escenario Principal */}
      <main className="flex-1 relative flex flex-col md:flex-row items-center justify-center p-4 md:p-8 gap-4 md:gap-8">
        {/* Fondo decorativo */}
        <div
          className="absolute inset-0 opacity-5 pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(#06b6d4 1px, transparent 1px), linear-gradient(90deg, #06b6d4 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        ></div>

        <CharacterCard
          img={avatars.left}
          isActive={currentData.speaker === 'left'}
          align="left"
          name="Martín"
          role="Investigador"
        />

        {/* Contenido Central */}
        <div className="flex-1 w-full max-w-3xl z-10 flex flex-col gap-4">
          <div
            className={`
            bg-slate-800/95 backdrop-blur-md border rounded-xl p-4 md:p-6 shadow-2xl transition-all duration-500 flex flex-col h-full min-h-[400px]
            ${
              currentData.speaker === 'left'
                ? 'border-l-4 border-l-orange-500 rounded-tl-none border-slate-700'
                : 'border-r-4 border-r-cyan-500 rounded-tr-none border-slate-700'
            }
          `}
          >
            <div className="mb-2">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-700 pb-1 mb-2">
                {currentData.title}
              </h3>
            </div>

            <div className="flex items-center justify-between mb-4">
              <span
                className={`text-sm font-bold flex items-center gap-2 ${
                  currentData.speaker === 'left'
                    ? 'text-orange-400'
                    : 'text-cyan-400'
                }`}
              >
                {currentData.speaker === 'left' ? (
                  <ArrowLeft size={14} />
                ) : null}
                {currentData.name} está hablando...
                {currentData.speaker === 'right' ? (
                  <ChevronRight size={14} />
                ) : null}
              </span>
              {isPlaying && !isPaused && (
                <span className="flex gap-1">
                  <span
                    className="w-1 h-1 bg-slate-400 rounded-full animate-bounce"
                    style={{ animationDelay: '0ms' }}
                  ></span>
                  <span
                    className="w-1 h-1 bg-slate-400 rounded-full animate-bounce"
                    style={{ animationDelay: '150ms' }}
                  ></span>
                  <span
                    className="w-1 h-1 bg-slate-400 rounded-full animate-bounce"
                    style={{ animationDelay: '300ms' }}
                  ></span>
                </span>
              )}
            </div>

            <div className="flex flex-col md:flex-row gap-4 flex-1">
              <div className="flex-1 overflow-y-auto pr-2 max-h-[200px] md:max-h-[300px] custom-scrollbar">
                <p className="text-base md:text-lg leading-relaxed text-slate-200">
                  {currentData.text}
                </p>
              </div>

              {currentData.imageContent && (
                <div className="w-full md:w-1/2 h-40 md:h-auto rounded-lg overflow-hidden border border-slate-600 shadow-lg relative group shrink-0">
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent opacity-60"></div>
                  <img
                    src={currentData.imageContent}
                    alt="Contenido visual"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute bottom-2 left-2 right-2 text-[10px] text-white opacity-70 bg-black/50 p-1 rounded">
                    Imagen de referencia pedagógica
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Controles */}
          <div className="bg-slate-950 rounded-lg p-3 md:p-4 border border-slate-800 flex flex-col gap-3 shadow-lg">
            <div className="flex items-center justify-between gap-4">
              <button
                onClick={handlePrev}
                disabled={currentSlide === 0}
                className={`
                    px-4 py-2 rounded font-bold flex items-center gap-2 transition-all text-xs md:text-sm
                    ${
                      currentSlide === 0
                        ? 'text-slate-700 cursor-not-allowed'
                        : 'text-slate-400 hover:text-cyan-400 hover:bg-slate-900'
                    }
                `}
              >
                <ArrowLeft size={16} />{' '}
                <span className="hidden md:inline">ANTERIOR</span>
              </button>

              <button
                onClick={togglePause}
                disabled={finishedSlide}
                className={`
                        p-3 rounded-full transition-all border border-slate-700
                        ${
                          isPaused
                            ? 'bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30 animate-pulse'
                            : finishedSlide
                            ? 'bg-slate-800 text-slate-600'
                            : 'bg-slate-800 text-cyan-400 hover:bg-slate-700'
                        }
                    `}
                title={isPaused ? 'Reanudar Audio' : 'Pausar Audio'}
              >
                {isPaused ? (
                  <Play
                    size={20}
                    fill="currentColor"
                  />
                ) : (
                  <Pause
                    size={20}
                    fill="currentColor"
                  />
                )}
              </button>

              <button
                onClick={handleNext}
                className={`
                    px-5 py-2 rounded font-bold flex items-center gap-2 transition-all text-xs md:text-sm
                    ${
                      finishedSlide
                        ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                        : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                    }
                `}
              >
                {finishedSlide ? 'CONTINUAR' : 'SIGUIENTE'}
                <ChevronRight size={18} />
              </button>
            </div>

            <div className="relative w-full h-2 bg-slate-800 rounded-full overflow-hidden group cursor-wait">
              <div
                className={`h-full transition-all duration-100 ease-linear ${
                  isPaused
                    ? 'bg-yellow-500'
                    : 'bg-gradient-to-r from-cyan-500 to-blue-500'
                }`}
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>

        <CharacterCard
          img={avatars.right}
          isActive={currentData.speaker === 'right'}
          align="right"
          name="Nataniel"
          role="Analista"
        />
      </main>

      {/* CRUCIAL: Agregamos onTimeUpdate para que el progreso dependa del audio real */}
      <audio
        ref={audioRef}
        src={currentData.audioUrl}
        onEnded={() => {
          setIsPlaying(false)
          setFinishedSlide(true)
        }}
        onTimeUpdate={handleAudioUpdate}
        className="hidden"
      />

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(30, 41, 59, 0.5);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(6, 182, 212, 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(6, 182, 212, 0.6);
        }
      `}</style>
    </div>
  )
}

const CharacterCard = ({ img, isActive, align, name, role }) => {
  return (
    <div
      className={`
      transition-all duration-500 flex flex-col items-center gap-3 relative shrink-0
      ${
        isActive
          ? 'scale-105 opacity-100 z-20 grayscale-0'
          : 'scale-90 opacity-40 grayscale blur-[1px]'
      }
      ${align === 'left' ? 'order-1' : 'order-3'}
    `}
    >
      <div
        className={`
        relative w-24 h-24 md:w-40 md:h-40 rounded-full border-4 overflow-hidden bg-slate-800 shadow-2xl transition-colors duration-500
        ${
          isActive
            ? align === 'left'
              ? 'border-orange-500 shadow-[0_0_30px_rgba(249,115,22,0.3)]'
              : 'border-cyan-500 shadow-[0_0_30px_rgba(6,182,212,0.3)]'
            : 'border-slate-700'
        }
      `}
      >
        <img
          src={img}
          alt={name}
          className="w-full h-full object-cover"
        />

        {isActive && (
          <div className="absolute bottom-2 right-2 md:bottom-4 md:right-4 bg-slate-900 p-1.5 rounded-full border border-slate-600 animate-bounce">
            <Mic
              size={14}
              className="text-white"
            />
          </div>
        )}
      </div>

      <div
        className={`text-center transition-opacity duration-300 ${
          isActive ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <h3 className="font-bold text-slate-200 text-sm md:text-base">
          {name}
        </h3>
        <span className="text-[10px] md:text-xs text-cyan-500 font-mono uppercase tracking-widest">
          {role}
        </span>
      </div>
    </div>
  )
}

export default App
