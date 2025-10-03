import { Button } from '@radix-ui/themes';
import "@radix-ui/themes/styles.css";
import './App.css'
function App() {

  return (
    <>
      <head>
        <title>OSHWDem</title>
      </head>
      <section id="hero-section">
        <div className="hero-layout-container">  
          <div id="hero-text">
            <img src="logo-oshwdem-2025.png" alt="" />
            <h2>La feria de tecnologías abiertas más grande de España</h2>
            <Button className='hero-button'>Visita nuestro blog </Button>
          </div>
          <img className="hero-image" src="oshwi.png" alt="" />
        </div>
      </section>
      <section id="about-section">
          <h2>Sobre nosotros</h2>
        <div className="about-section-container">
          <img src="about-image.png" alt="" className="about-img" />
          <div className="about-text-container">
            <p className='about-oshwdem about-text'>La OSHWDem, /ósdem/ acrónimo de Open Source HardWare Demonstration por sus siglas en inglés, traducida como Feria de Tecnología Abierta, es un evento al estilo BarCamp, que se viene realizando anualmente desde el año 2012 en la comarca de A Coruña. Se pretende el acercamiento y demostración al público general de las posibilidades del Hardware libre Este evento, además de la propia demostración, viene acompañado de talleres, charlas y competiciones de robótica. Todo ello de carácter gratuito para el público participante.
            </p>
            <p className='about-oshwdem about-text'>Está organizada por BricoLabs, un grupo de gente apasionado por el mundo maker que actualmente basa sus actividades en el espacio maker@domus del Museo Domus.
            </p>
          </div>
        </div>
      </section>
      <section id="sponsors-section">
      <h2>Patrocinan</h2>
        <h3>Competiciones</h3>
          <div className="competition-sponsors">
            <a className="big-sponsor sponsor" href="https://tienda.bricogeek.com/">
              <div className="sponsor-img-container">
                <img src="logo-bricogeek.jpg" alt="BricoGeek" className="sponsor-logo" width={400}/>
              </div>
              <span className="sponsor-text">BricoGeek - Combate</span>
            </a>
            {["Laberinto", "Siguelíneas", "Hebocon", "Persecución", "Minisumo"].map(name => 
              <a className="big-sponsor sponsor" href="https://sponsor.website/">
              <div className="sponsor-img-container">
                <div className='sponsor-us-text'>Patrocinio <br></br>pulponible
                </div>
              </div>
              <span className="sponsor-text">{name}</span>
            </a>
            )}
          </div>
        <div id="talk-sponsors-section">
          <h3>Charlas</h3>
          <div className="talk-sponsors">
            {["Laboratorio 1", "Laboratorio 2", "Laboratorio 3"].map(name =>
                <a className="big-sponsor sponsor" href="https://sponsor.website/">
                <div className="sponsor-img-container">
                  <div className='sponsor-us-text'>Patrocinio <br></br>pulponible
                  </div>
                </div>
                <span className="sponsor-text">{name}</span>
              </a>
              )}
          </div>
        </div>
        {/* <section id="general-sponsors-section">
          <h3>General</h3>
          </section>
          <h3>Hacen esto posible</h3>
          <section id="collaborators-section">
          <a href="https://sponsor.website/">
              <img src="" alt="" className="sponsor-logo" />
          </a>
        </section> */}
      </section>
      <footer id="footer">
        <div className="contact-info">
        <img src="logo-oshwdem-2025.png" alt="" width={300}/>
          <h3>Contacto</h3>
          <a href="mailto:info@oshwdem.org">info@oshwdem.org</a>
          <a href="mailto:contacto@bricolabs.cc">contacto@bricolabs.cc</a>
          <a href="">bricolabs.cc</a>
          <a href="">Twitter @oshwdem</a>
          <a href="">Instagram @oshwdem</a>
          <a href="">Mastodon @oshwdem.mastodon.social</a>
          <a href="">BlueSky @oshwdem.bsky.app</a>
        </div>
      </footer>
    </>
  )
}

export default App
