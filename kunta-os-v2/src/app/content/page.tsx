import { AppHeader } from '@/components/app-header';

const pillars = [
  { title: 'Proof', body: 'Show why simple rituals make sense without overclaiming.' },
  { title: 'Pain', body: 'Name product overload, wasted money, and shelf confusion.' },
  { title: 'Remedy', body: 'Teach cleanse, polish, moisturize, scent, and reset.' },
  { title: 'Dream', body: 'Show the future: calm shelf, clean rhythm, personal scent.' }
];

export default function ContentPage() {
  return (
    <main className="shell">
      <AppHeader />
      <section className="card" style={{ marginBottom: '1rem' }}>
        <p className="eyebrow">Content</p>
        <h1>Content engine</h1>
        <p>Draft public content from the brand doctrine without exposing internal strategy on the customer-facing site.</p>
      </section>
      <section className="grid workflow">
        {pillars.map((pillar) => (
          <article className="card" key={pillar.title}>
            <span className="badge">{pillar.title}</span>
            <h2>{pillar.title}</h2>
            <p>{pillar.body}</p>
          </article>
        ))}
      </section>
      <section className="grid two-grid" style={{ marginTop: '1rem' }}>
        <form className="card form-grid">
          <h2>Draft content</h2>
          <label>Channel<select className="input"><option>Site</option><option>Email</option><option>Instagram</option><option>TikTok</option><option>YouTube Shorts</option><option>Blog</option></select></label>
          <label>Hook<input className="input" placeholder="Stop buying random products." /></label>
          <label>Body<textarea className="input" rows={5} placeholder="Teach one simple ritual step." /></label>
          <label>Call to action<input className="input" placeholder="Take the free ritual quiz." /></label>
          <label>Status<select className="input"><option>Draft</option><option>Review</option><option>Approved</option><option>Active</option></select></label>
          <button type="button">Save draft</button>
        </form>
        <article className="card">
          <h2>Public content rule</h2>
          <p>Public content should sell the future and guide the next step. It should not reveal internal hooks, conversion tactics, sourcing strategy, or workflow logic.</p>
          <div className="notice">Best CTA: Take the quiz, get the guide, then shop the routine.</div>
        </article>
      </section>
    </main>
  );
}
