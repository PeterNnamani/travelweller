import Image from 'next/image';
import OfferNavTrigger from '../src/components/offer-nav-trigger';
import OpportunityAccessFlow from '../src/components/opportunity-access-flow';
import mainLogo from '../src/images/WD-new-logo.webp';
import doctorPortrait from '../src/images/Wakawaka-Doctor-winter6.webp';
import visaStamp from '../src/images/Visas3.webp';
import signature from '../src/images/Signature-300x176.webp';
import exploreImage1 from '../src/images/image.png';
import exploreImage2 from '../src/images/image copy.png';
import exploreImage3 from '../src/images/image copy 2.png';
import fullWidthImage from '../src/images/image copy 3.png';
import footerLogo from '../src/images/WD-new-logo 2.jpg';

const latestPostImage1 = 'https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&w=900&q=80';
const latestPostImage2 = 'https://images.unsplash.com/photo-1521295121783-8a321d551ad2?auto=format&fit=crop&w=900&q=80';
const latestPostImage3 = 'https://images.unsplash.com/photo-1502920514313-52581002a659?auto=format&fit=crop&w=900&q=80';

export default function HomePage() {
    return (
        <main className="page-shell">
            <header className="topbar">
                <div className="topbar__brand-wrap">
                    <div className="topbar__logo-box">
                        <Image src={mainLogo} alt="WD logo" width={150} height={54} priority />
                    </div>
                </div>

                <nav className="topbar__nav" aria-label="Main navigation">
                    <a href="#">HOME</a>
                    <a href="#">ABOUT</a>
                    <a href="#">TRAVEL INFO</a>
                    <a href="#">SHOP</a>
                    <a href="#">INFO HUB</a>
                    <a href="#">CONTACT</a>
                    <OfferNavTrigger />
                </nav>

                <div className="topbar__actions" aria-label="Quick actions">
                    <button type="button" className="topbar__search" aria-label="Search">⌕</button>
                    <button type="button" className="topbar__menu" aria-label="Open menu">☰</button>
                </div>
            </header>

            <section className="feature-hero">
                <div className="feature-hero__content">
                    <div className="feature-hero__meta-line">
                        <span className="feature-hero__tag">TRAVEL TIPS</span>
                        <span className="feature-hero__tag-bar" />
                    </div>

                    <h1 className="feature-hero__title">
                        Secret Visa Strategy:<br />
                        EXCLUSIVE 1-on-1<br />
                        Migration Sessions
                    </h1>

                    <div className="feature-hero__info-row">
                        <div className="feature-hero__info-item">
                            <span className="feature-hero__label">Written By</span>
                            <div className="feature-hero__author-box">
                                <span className="feature-hero__avatar">W</span>
                                <span>WWD</span>
                            </div>
                        </div>
                        <div className="feature-hero__info-item">
                            <span className="feature-hero__label">Published on</span>
                            <div className="feature-hero__date-box">
                                <span className="feature-hero__calendar" aria-hidden="true">◔</span>
                                <span>14th Aug, 2026</span>
                            </div>
                        </div>
                        <div className="feature-hero__info-item">
                            <span className="feature-hero__label">Comments By</span>
                            <div className="feature-hero__comment-box">
                                <span className="feature-hero__comment-icon" aria-hidden="true">◌</span>
                                <span>0</span>
                            </div>
                        </div>
                    </div>

                    <button className="feature-hero__cta" type="button">READ MORE</button>
                </div>

                <div className="feature-hero__side-copy">
                    <span className="feature-hero__control feature-hero__control--active" />
                    <span className="feature-hero__control" />
                    <p>
                        Secret Visa Strategy: Discover the secret visa strategy with WakaWaka Doctor and
                        StudyNow UK. Get free admission support, visa assistance, and exclusive 1-on-1 migration
                        sessions. As immigration policies across major
                    </p>
                </div>
            </section>

            <OpportunityAccessFlow />

            <section className="doctor-profile" aria-label="Doctor profile">
                <div className="doctor-profile__frame">
                    <div className="doctor-profile__photo-wrap">
                        <Image src={doctorPortrait} alt="WakaWaka Doctor portrait" fill priority className="doctor-profile__photo" />
                        <div className="doctor-profile__stamp-wrap">
                            <Image src={visaStamp} alt="Visa stamp overlay" fill className="doctor-profile__stamp" />
                        </div>
                    </div>
                </div>

                <div className="doctor-profile__copy">
                    <h2>Hello there.</h2>
                    <p>It’s your One and Only WakaWaka Doctor.</p>

                    <p>
                        I was born and bred in the distant parts of Lagos to hard working Yoruba parents who sacrificed everything for their kids.
                    </p>

                    <p>
                        I lost my dearest mum in 2018. While alive, she used to say “No market place has only one door”.
                    </p>

                    <p>
                        Catch my drift yet? Follow me...
                    </p>

                    <p>
                        The term “wakawaka” is an informal lingo to describe a globe trotter. I am a practicing Medical doctor with interests in Mental and Public Health who just loves to jolly. Travelling, seeing new places and cultures, meeting new people helps me achieve this.
                    </p>

                    <p>
                        My Job has taken me to 5 countries and 3 continents. Did I mention how much I love food? Oh dear!!! Good culinary presentation takes my breath away. I am extremely adventurous and open to new things.
                    </p>

                    <p>
                        At the start of 2020 after seeing almost 25 countries, I decided to document all my trips, to show you the world through my eyes. So from long walks through forests, to adrenaline-pumping skydiving. I will show you all.
                    </p>

                    <p>
                        Welcome to my world and let’s wakawaka.
                    </p>

                    <p className="doctor-profile__closing">Yours truly,</p>

                    <div className="doctor-profile__signature-wrap" aria-label="Signature">
                        <Image src={signature} alt="Doctor signature" width={220} height={130} />
                    </div>

                </div>
            </section>

            <section className="explore-section">
                <h2 className="explore-section__title">Explore</h2>

                <div className="explore-section__cards">
                    <div className="explore-section__card">
                        <div className="explore-section__card-image">
                            <Image src={exploreImage1} alt="WAKAWAKA CORNER" fill className="explore-section__card-img" />
                        </div>
                        <div className="explore-section__card-label">WAKAWAKA CORNER</div>
                    </div>

                    <div className="explore-section__card">
                        <div className="explore-section__card-image">
                            <Image src={exploreImage2} alt="WAKAWAKA STORIES" fill className="explore-section__card-img" />
                        </div>
                        <div className="explore-section__card-label">WAKAWAKA STORIES</div>
                    </div>

                    <div className="explore-section__card">
                        <div className="explore-section__card-image">
                            <Image src={exploreImage3} alt="WAKAWAKA PLACES" fill className="explore-section__card-img" />
                        </div>
                        <div className="explore-section__card-label">WAKAWAKA PLACES</div>
                    </div>
                </div>

                <div className="explore-section__tagline">#Globetrotter, I create memories!</div>
            </section>

            <div className="fullwidth-image-section">
                <Image
                    src={fullWidthImage}
                    alt="Full width section"
                    quality={90}
                    style={{ width: '100%', height: 'auto' }}
                    priority
                />
            </div>

            <section className="latest-posts">
                <h2 className="latest-posts__title">Latest Posts</h2>
                <div className="latest-posts__divider">
                    <span className="latest-posts__divider-line" />
                    <span className="latest-posts__divider-icon">✎</span>
                    <span className="latest-posts__divider-line" />
                </div>

                <div className="latest-posts__grid">
                    <div className="latest-posts__card latest-posts__card--featured">
                        <div className="latest-posts__featured-image">
                            <Image src={latestPostImage1} alt="Secret Visa Strategy" fill className="latest-posts__featured-img" />
                            <span className="latest-posts__tag">TRAVEL TIPS</span>
                        </div>
                        <div className="latest-posts__avatar-circle">
                            <span className="latest-posts__avatar-text">W</span>
                        </div>
                        <h3 className="latest-posts__card-title">Secret Visa Strategy: EXCLUSIVE 1-on-1 Migration Sessions</h3>
                        <button className="latest-posts__read-more">READ MORE »</button>
                        <div className="latest-posts__author">WWD</div>
                    </div>

                    <div className="latest-posts__card latest-posts__card--compact">
                        <div className="latest-posts__mini-image">
                            <Image src={latestPostImage2} alt="Visa Programs" fill className="latest-posts__mini-img" />
                        </div>
                        <h3 className="latest-posts__card-title">Visa Programs: The SECRET Way to Relocate Abroad Without Money</h3>
                        <button className="latest-posts__read-more">READ MORE »</button>
                        <div className="latest-posts__author">WWD</div>
                    </div>

                    <div className="latest-posts__card latest-posts__card--compact">
                        <div className="latest-posts__mini-image">
                            <Image src={latestPostImage3} alt="US Visa processing" fill className="latest-posts__mini-img" />
                        </div>
                        <h3 className="latest-posts__card-title">US Visa processing – 3 shocking changes as Washington pulls services from Abuja</h3>
                        <button className="latest-posts__read-more">READ MORE »</button>
                        <div className="latest-posts__author">WWD</div>
                    </div>
                </div>
            </section>

            <section className="newsletter-section">
                <div className="newsletter-section__overlay" />
                <div className="newsletter-section__content">
                    <h2 className="newsletter-section__title">Want access to my exclusive travel hacks?</h2>

                    <form className="newsletter-section__form">
                        <div className="newsletter-section__form-row">
                            <input type="text" placeholder="First Name" className="newsletter-section__input" />
                            <input type="text" placeholder="Last Name" className="newsletter-section__input" />
                        </div>

                        <input type="email" placeholder="Email Address" className="newsletter-section__input newsletter-section__input--full" />

                        <div className="newsletter-section__checkbox-wrap">
                            <input type="checkbox" id="terms-check" className="newsletter-section__checkbox" />
                            <label htmlFor="terms-check" className="newsletter-section__checkbox-label">
                                By ticking this box, you agree with this website's <a href="#" className="newsletter-section__link">terms & conditions</a> and <a href="#" className="newsletter-section__link">privacy policy</a>
                            </label>
                        </div>

                        <button type="submit" className="newsletter-section__button">SUBSCRIBE HERE! ✓</button>

                        <p className="newsletter-section__privacy-note">🔒 Your details are safe and will not be shared with any third party.</p>
                    </form>
                </div>
            </section>

            <footer className="footer">
                <div className="footer__content">
                    <div className="footer__logo-circle">
                        <Image src={footerLogo} alt="WakaWaka Doctor" width={150} height={150} />
                    </div>

                    <div className="footer__social">
                        <a href="#" className="footer__social-link" aria-label="Instagram">📷</a>
                        <a href="#" className="footer__social-link" aria-label="Twitter">𝕏</a>
                        <a href="#" className="footer__social-link" aria-label="YouTube">▶</a>
                    </div>

                    <nav className="footer__links">
                        <a href="#">PRIVACY POLICY</a>
                        <a href="#">TERMS & CONDITIONS</a>
                        <a href="#">SITEMAP</a>
                    </nav>

                    <p className="footer__copyright">© 2026 WAKAWAKA DOCTOR | MADE WITH ❤ BY <a href="#" className="footer__copyright-link">EYEGLITHED DIGITAL</a></p>
                </div>
            </footer>
        </main>
    );
}
