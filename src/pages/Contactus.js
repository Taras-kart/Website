import React from "react";
import "./Contactus.css";
import NavbarFinal from "./Navbar";
import Footer from "./Footer";

const Contactus = () => {
    return (
        <div className="contact-page">
            <NavbarFinal />
            <main className="contact-main">
                <section className="contact-hero">
                    <img
                        className="contact-hero__img"
                        src="/images/contact-banner.jpg"
                        alt="Contact banner"
                    />
                    <div className="contact-hero__overlay" />
                    <div className="contact-hero__content">
                        <h1 className="contact-hero__title">TARAS KART</h1>
                    </div>
                </section>

                <section className="contact-intro">
                    <div className="contact-intro__container">
                        <div className="contact-intro__left">
                            <img
                                className="contact-intro__img"
                                src="/images/contact-side.jpg"
                                alt="Customer support"
                            />
                            <div className="contact-intro__imgOverlay" />
                            <div className="contact-intro__imgTag">
                                Fast support, clear answers
                            </div>
                        </div>

                        <div className="contact-intro__right">
                            <div className="contact-intro__badge">Customer Care</div>

                            <h2 className="contact-intro__title">
                                We’re here to help you shop with confidence
                            </h2>

                            <p className="contact-intro__text">
                                Need help choosing the right size, tracking your order, or
                                understanding delivery timelines? Our team supports Men, Women,
                                and Kids collections and will guide you with simple, quick
                                answers.
                            </p>

                            <div className="contact-intro__highlights">
                                <div className="contact-intro__highlight">
                                    <div className="contact-intro__highlightTitle">Order support</div>
                                    <div className="contact-intro__highlightText">
                                        Updates on order status, delivery estimates, and address changes.
                                    </div>
                                </div>

                                <div className="contact-intro__highlight">
                                    <div className="contact-intro__highlightTitle">Size help</div>
                                    <div className="contact-intro__highlightText">
                                        Fit guidance for kurta sets, shirts, sarees, kids wear, and more.
                                    </div>
                                </div>

                                <div className="contact-intro__highlight">
                                    <div className="contact-intro__highlightTitle">Returns and exchanges</div>
                                    <div className="contact-intro__highlightText">
                                        Step by step help for pickups, replacements, and refunds.
                                    </div>
                                </div>
                            </div>

                            <ul className="contact-intro__list">
                                <li>Product availability and restock queries</li>
                                <li>Bulk orders and special requests</li>
                                <li>Payment and invoice support</li>
                                <li>Quality checks and issue resolution</li>
                            </ul>

                            <div className="contact-intro__cta">
                                <div className="contact-intro__ctaTitle">Tip</div>
                                <div className="contact-intro__ctaText">
                                    Keep your order ID ready, it helps us resolve things faster.
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="branches">
                    <div className="branches__container">
                        <div className="branches__head">
                            <h2 className="branches__title">Our Offline Branches</h2>
                            <p className="branches__subtitle">
                                Visit us in-store for a closer look, better fit checks, and faster support.
                            </p>
                        </div>

                        <div className="branches__grid">
                            <article className="branch-card">
                                <div className="branch-card__media">
                                    <img className="branch-card__img" src="/images/branch1.jpg" alt="Vizianagaram Branch" />
                                    <div className="branch-card__shade" />
                                </div>
                                <div className="branch-card__body">
                                    <div className="branch-card__name">Vizianagaram</div>
                                    <div className="branch-card__addr">
                                        Door No: 8-1-22, Bochupeta, Besides Thotapalem Road, Opp RTC Complex, Vizianagaram, Andhra Pradesh 535003
                                    </div>
                                </div>
                            </article>

                            <article className="branch-card">
                                <div className="branch-card__media">
                                    <img className="branch-card__img" src="/images/branch2.jpg" alt="Visakhapatnam Branch" />
                                    <div className="branch-card__shade" />
                                </div>
                                <div className="branch-card__body">
                                    <div className="branch-card__name">Visakhapatnam</div>
                                    <div className="branch-card__addr">
                                        Door No: 26-41-8, 26-38-9, CMR Central, 1st Floor, Gajuwaka, Visakhapatnam, Andhra Pradesh 530020
                                    </div>
                                </div>
                            </article>

                            <article className="branch-card">
                                <div className="branch-card__media">
                                    <img className="branch-card__img" src="/images/branch3.jpg" alt="Visakhapatnam Branch 2" />
                                    <div className="branch-card__shade" />
                                </div>
                                <div className="branch-card__body">
                                    <div className="branch-card__name">Visakhapatnam</div>
                                    <div className="branch-card__addr">
                                        Door No: 52-1-35, 36, 361, New Resapuvanipalem, CMR Central, Maddilapalem, Visakhapatnam, Andhra Pradesh
                                        530013
                                    </div>
                                </div>
                            </article>

                            <article className="branch-card">
                                <div className="branch-card__media">
                                    <img className="branch-card__img" src="/images/branch4.jpg" alt="Vizianagaram Branch 2" />
                                    <div className="branch-card__shade" />
                                </div>
                                <div className="branch-card__body">
                                    <div className="branch-card__name">Vizianagaram</div>
                                    <div className="branch-card__addr">
                                        Door No: 16-1-61, MG Road, Vizianagaram, Andhra Pradesh 535002
                                    </div>
                                </div>
                            </article>
                        </div>
                    </div>
                </section>


                <section className="contact-help">
                    <div className="contact-help__container">
                        <div className="contact-help__head">
                            <h2 className="contact-help__title">Need Help Fast?</h2>
                            <p className="contact-help__subtitle">
                                Send us a message and we’ll get back with the right support for orders, sizing, delivery, returns, and store queries.
                            </p>
                        </div>

                        <div className="contact-help__grid">
                            <div className="contact-help__left">
                                <div className="contact-help__card">
                                    <div className="contact-help__cardTitle">Support Hours</div>
                                    <div className="contact-help__cardText">Mon to Sat, 10:00 AM to 7:00 PM</div>

                                    <div className="contact-help__divider" />

                                    <div className="contact-help__miniGrid">
                                        <div className="contact-help__mini">
                                            <div className="contact-help__miniLabel">Phone</div>
                                            <div className="contact-help__miniValue">+91 9111336789</div>
                                        </div>
                                        <div className="contact-help__mini">
                                            <div className="contact-help__miniLabel">Email</div>
                                            <div className="contact-help__miniValue">support@taraskart.com</div>
                                        </div>
                                        <div className="contact-help__mini">
                                            <div className="contact-help__miniLabel">WhatsApp</div>
                                            <div className="contact-help__miniValue">+91 9859871234</div>
                                        </div>
                                        <div className="contact-help__mini">
                                            <div className="contact-help__miniLabel">Stores</div>
                                            <div className="contact-help__miniValue">4 Offline Branches</div>
                                        </div>
                                    </div>

                                    <div className="contact-help__note">
                                        Keep your order ID ready for quicker updates.
                                    </div>
                                </div>

                                <div className="contact-help__tiles">
                                    <div className="contact-help__tile">
                                        <div className="contact-help__tileTitle">Order Tracking</div>
                                        <div className="contact-help__tileText">Get delivery updates and shipment status.</div>
                                    </div>
                                    <div className="contact-help__tile">
                                        <div className="contact-help__tileTitle">Returns</div>
                                        <div className="contact-help__tileText">Easy help for pickup, exchange, and refunds.</div>
                                    </div>
                                    <div className="contact-help__tile">
                                        <div className="contact-help__tileTitle">Sizing</div>
                                        <div className="contact-help__tileText">Find the right fit for Men, Women, and Kids.</div>
                                    </div>
                                </div>
                            </div>

                            <div className="contact-help__right">
                                <div className="contact-help__formWrap">
                                    <div className="contact-help__formHead">
                                        <div className="contact-help__formBadge">Message Us</div>
                                        <h3 className="contact-help__formTitle">Tell us what you need</h3>
                                        <p className="contact-help__formSub">
                                            Fill this form and we will respond as soon as possible.
                                        </p>
                                    </div>

                                    <form className="contact-help__form" onSubmit={(e) => e.preventDefault()}>
                                        <div className="contact-help__row">
                                            <div className="contact-help__field">
                                                <label className="contact-help__label">Full Name</label>
                                                <input className="contact-help__input" type="text" placeholder="Enter your name" />
                                            </div>
                                            <div className="contact-help__field">
                                                <label className="contact-help__label">Mobile Number</label>
                                                <input className="contact-help__input" type="tel" placeholder="Enter your mobile number" />
                                            </div>
                                        </div>

                                        <div className="contact-help__row">
                                            <div className="contact-help__field">
                                                <label className="contact-help__label">Email</label>
                                                <input className="contact-help__input" type="email" placeholder="Enter your email" />
                                            </div>
                                            <div className="contact-help__field">
                                                <label className="contact-help__label">Topic</label>
                                                <select className="contact-help__select" defaultValue="Order Support">
                                                    <option>Order Support</option>
                                                    <option>Delivery</option>
                                                    <option>Returns</option>
                                                    <option>Size Help</option>
                                                    <option>Store Query</option>
                                                    <option>Other</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="contact-help__field">
                                            <label className="contact-help__label">Message</label>
                                            <textarea className="contact-help__textarea" rows="5" placeholder="Write your message here..." />
                                        </div>

                                        <button className="contact-help__btn" type="submit">
                                            Send Message
                                        </button>

                                        <div className="contact-help__privacy">
                                            By sending this message, you agree to be contacted by our support team.
                                        </div>
                                    </form>
                                </div>


                            </div>
                        </div>
                    </div>
                </section>

                <section className="contact-faq">
                    <div className="contact-faq__container">
                        <div className="contact-faq__head">
                            <h2 className="contact-faq__title">Quick Answers</h2>
                            <p className="contact-faq__subtitle">
                                Before you message us, check these common questions. It saves time and gets you the answer faster.
                            </p>
                        </div>

                        <div className="contact-faq__grid">
                            <div className="contact-faq__left">
                                <div className="faq-card">
                                    <div className="faq-card__q">How can I track my order?</div>
                                    <div className="faq-card__a">
                                        Go to the Track Order page and enter your order ID. If you need help, share your order ID in the message form.
                                    </div>
                                </div>

                                <div className="faq-card">
                                    <div className="faq-card__q">What if I received the wrong size?</div>
                                    <div className="faq-card__a">
                                        You can request an exchange. Keep the product unused with tags, and we’ll guide you through pickup and replacement.
                                    </div>
                                </div>

                                <div className="faq-card">
                                    <div className="faq-card__q">How long does delivery take?</div>
                                    <div className="faq-card__a">
                                        Delivery time depends on your location. After your order is shipped, you’ll see the estimated date in tracking.
                                    </div>
                                </div>
                            </div>

                            <div className="contact-faq__right">
                                <div className="faq-panel">
                                    <div className="faq-panel__badge">Popular</div>
                                    <div className="faq-panel__title">Returns and Refunds</div>
                                    <div className="faq-panel__text">
                                        Refunds are processed after quality check and return pickup confirmation. The time taken may vary based on bank and payment method.
                                    </div>

                                    <div className="faq-panel__chips">
                                        <span className="faq-chip">Exchange</span>
                                        <span className="faq-chip">Refund</span>
                                        <span className="faq-chip">Delivery</span>
                                        <span className="faq-chip">Payment</span>
                                    </div>

                                    <div className="faq-panel__image">
                                        <img src="/images/faq-banner.jpg" alt="FAQ banner" />
                                        <div className="faq-panel__overlay" />
                                        <div className="faq-panel__imageText">Fast help, clear steps</div>
                                    </div>

                                    <div className="faq-panel__note">
                                        For store related questions, visit the branches section above and choose the nearest location.
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>


                <section className="contact-promise">
                    <div className="contact-promise__container">
                        <div className="contact-promise__card">
                            <div className="contact-promise__media">
                                <img className="contact-promise__img" src="/images/promise2.jpg" alt="Taras Kart promise" />
                                <div className="contact-promise__overlay" />
                                <div className="contact-promise__stamp">
                                    <div className="contact-promise__stampTop">TARAS KART</div>
                                    <div className="contact-promise__stampBottom">Promise</div>
                                </div>
                            </div>

                            <div className="contact-promise__content">
                                <h2 className="contact-promise__title">A smoother shopping experience, every time</h2>
                                <p className="contact-promise__text">
                                    We keep things simple, clear, and fast. Whether you shop online or visit our stores, our goal is to help you find the
                                    right style and get it to you without stress.
                                </p>

                                <div className="contact-promise__grid">
                                    <div className="promise-item">
                                        <div className="promise-item__title">Clear updates</div>
                                        <div className="promise-item__text">Order status and delivery timelines, without confusion.</div>
                                    </div>
                                    <div className="promise-item">
                                        <div className="promise-item__title">Easy support</div>
                                        <div className="promise-item__text">Quick help for payments, returns, exchanges, and queries.</div>
                                    </div>
                                    <div className="promise-item">
                                        <div className="promise-item__title">Better fit</div>
                                        <div className="promise-item__text">Size guidance for Men, Women, and Kids collections.</div>
                                    </div>
                                    <div className="promise-item">
                                        <div className="promise-item__title">Store assistance</div>
                                        <div className="promise-item__text">Walk in to try, check quality, and get faster resolutions.</div>
                                    </div>
                                </div>

                                <div className="contact-promise__bar">
                                    <div className="contact-promise__barTitle">What you can expect</div>
                                    <div className="contact-promise__barText">
                                        Friendly responses, practical solutions, and a premium experience in our white, gold, and black style.
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>







            </main>
            <Footer />
        </div>
    );
};

export default Contactus;
