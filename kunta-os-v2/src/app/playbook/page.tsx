import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AppHeader } from '@/components/app-header';
import { requireAdmin } from '@/lib/admin-auth';
import { createSupabaseAdminClient } from '@/lib/supabase/admin-client';

export const dynamic = 'force-dynamic';

const daily = [
  'Check customer replies, failed deliveries, refunds, and urgent exceptions.',
  'Confirm every paid order has a delivery record before doing marketing work.',
  'Reply to customer questions in plain language; never diagnose or promise outcomes.',
  'Record recurring questions as content ideas and product improvements.'
];

const weekly = [
  'Review visits → email signups → product interest → checkout → fulfilled orders.',
  'Choose one conversion leak to improve; do not change the entire funnel at once.',
  'Review product and content drafts. Approve only believable claims and ready fulfillment.',
  'Check revenue, fees, refunds, direct costs, support time, and contribution margin.',
  'Back up critical records and review admin access, integrations, and failed automations.'
];

const launchRules = [
  ['Free product', 'Public page works, links work, mobile works, email delivery tested.', 'May publish'],
  ['Paid digital product', 'Final file uploaded privately, Stripe live, webhook verified, delivery tested, refund terms visible.', 'May sell after a real low-value test'],
  ['Physical/POD product', 'Supplier approved, sample checked, true photos, landed cost known, shipping/refund policy confirmed.', 'May sell after fulfillment test'],
  ['Affiliate product', 'Official link, disclosure, current availability, clear ritual role, no unsupported claims.', 'May recommend'],
  ['Campaign or email', 'Audience consent, useful message, accurate CTA, unsubscribe path, links tested.', 'May send after approval']
];

const supportSop = [
  ['Delivery missing', 'Verify order and email → regenerate secure access → confirm receipt → log resolution. Never email a private file directly unless policy allows it.'],
  ['Refund request', 'Confirm order → apply published refund terms consistently → process in Stripe → record reason → revoke access when appropriate.'],
  ['Product complaint', 'Acknowledge → collect facts → avoid medical advice → offer the policy-based remedy → escalate safety concerns.'],
  ['Charge dispute', 'Preserve order, consent, checkout, delivery, and support records → respond through Stripe → do not contact aggressively.'],
  ['Unsafe claim or content', 'Unpublish or return to review → document why → revise → reapprove before reuse.'],
  ['System outage', 'Pause promotions and paid checkout if fulfillment is affected → post a truthful notice → restore → test → document recovery.']
];

const scorecard = [
  ['Qualified visits', 'Analytics', 'Weekly', 'Are the right people reaching the offer?'],
  ['Email signup rate', 'Signups ÷ signup-page visits', 'Weekly', 'Is the free value clear and trusted?'],
  ['Checkout conversion', 'Paid orders ÷ checkout starts', 'Weekly after launch', 'Is price/value/checkout causing friction?'],
  ['Error-free fulfillment', 'Delivered orders ÷ paid orders', 'Daily', 'Did every buyer receive value?'],
  ['Refund rate', 'Refunds ÷ paid orders', 'Weekly', 'Does the offer match expectations?'],
  ['Contribution margin', 'Revenue − fees − refunds − direct costs', 'Monthly', 'Is the business economically healthy?'],
  ['Support response time', 'Median first response', 'Weekly', 'Are customers cared for promptly?'],
  ['Repeat/referral signal', 'Repeat buyers + attributable referrals', 'Monthly', 'Did value create trust?']
];

function StatusCard({ label, ready, detail }: { label: string; ready: boolean; detail: string }) {
  return <article className="card status-card">
    <div className="row-between"><h2>{label}</h2><span className={ready ? 'badge badge-ready' : 'badge badge-waiting'}>{ready ? 'Ready' : 'Gate'}</span></div>
    <p>{detail}</p>
  </article>;
}

export default async function PlaybookPage() {
  if (!await requireAdmin()) redirect('/login');
  const supabase = createSupabaseAdminClient();
  const { data: products = [] } = await supabase
    .from('catalog_products')
    .select('id,name,price,checkout_status,status,fulfillment_model')
    .order('sort_order');

  const activeProducts = products?.filter((product) => product.status === 'active') || [];
  const freeReady = activeProducts.filter((product) => product.checkout_status === 'free_public').length;
  const paidLive = activeProducts.filter((product) => product.checkout_status === 'live').length;
  const paidWaiting = activeProducts.filter((product) => product.price > 0 && product.checkout_status !== 'live').length;
  const emailConfigured = Boolean(process.env.RESEND_API_KEY);
  const stripeConfigured = Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET);
  const deliveryConfigured = Boolean(process.env.DELIVERY_TOKEN_SECRET && process.env.SUPABASE_DELIVERY_BUCKET);

  return <main className="shell playbook">
    <AppHeader />
    <section className="card playbook-hero">
      <div>
        <p className="eyebrow">Owner operating system</p>
        <h1>Run Kunta Naturals without guessing.</h1>
        <p className="lead-copy">This is the source of truth for launch decisions, customer care, products, marketing, money, and exceptions. Start with today, then open only the procedure you need.</p>
      </div>
      <aside className="today-box">
        <strong>Today’s order</strong>
        <ol><li>Protect customers.</li><li>Fulfill paid promises.</li><li>Fix the biggest leak.</li><li>Publish one useful answer.</li></ol>
      </aside>
    </section>

    <section className="section-block">
      <div className="section-title"><p className="eyebrow">Live truth</p><h2>Launch control</h2></div>
      <div className="grid readiness-grid">
        <StatusCard label="Public launch" ready detail="The public site and free product path may stay live. Owner login is useful for management but does not block visitors." />
        <StatusCard label="Email delivery" ready={emailConfigured} detail={emailConfigured ? 'Resend is connected. Keep monitoring delivered, bounced, complained, and suppressed events.' : 'Connect Resend before promising inbox delivery.'} />
        <StatusCard label="Paid checkout" ready={stripeConfigured && deliveryConfigured && paidLive > 0} detail={paidLive ? `${paidLive} paid product(s) marked live.` : 'Keep payments disabled until Stripe, webhook, private files, delivery, refund handling, and a real purchase test pass.'} />
        <StatusCard label="Product ladder" ready={freeReady > 0} detail={`${freeReady} free product(s) ready; ${paidWaiting} paid product(s) remain early access; ${paidLive} paid product(s) live.`} />
      </div>
      <div className="notice"><strong>Current launch position:</strong> market the free ritual system and collect consented interest. Do not represent an early-access product as immediately purchasable.</div>
    </section>

    <section className="grid two-grid section-block">
      <article className="card">
        <p className="eyebrow">10 minutes</p><h2>Daily operator routine</h2>
        <ol className="spaced-list">{daily.map((item) => <li key={item}>{item}</li>)}</ol>
      </article>
      <article className="card">
        <p className="eyebrow">45 minutes</p><h2>Weekly owner review</h2>
        <ol className="spaced-list">{weekly.map((item) => <li key={item}>{item}</li>)}</ol>
      </article>
    </section>

    <section className="card section-block">
      <p className="eyebrow">Decision system</p><h2>What may go live?</h2>
      <div className="table-wrap"><table><thead><tr><th>Item</th><th>Evidence required</th><th>Decision</th></tr></thead><tbody>
        {launchRules.map(([item, evidence, decision]) => <tr key={item}><th>{item}</th><td>{evidence}</td><td><strong>{decision}</strong></td></tr>)}
      </tbody></table></div>
    </section>

    <section className="card section-block">
      <p className="eyebrow">Product value</p><h2>Before charging a customer</h2>
      <div className="quality-grid">
        <div><strong>Clear outcome</strong><p>The buyer can state what will be easier or more organized after using it.</p></div>
        <div><strong>Fast first win</strong><p>The first useful action takes ten minutes or less.</p></div>
        <div><strong>Complete deliverable</strong><p>No placeholder pages, missing files, vague bonuses, or inaccessible formats.</p></div>
        <div><strong>Believable promise</strong><p>No medical, guaranteed, fabricated, or unsupported claims.</p></div>
        <div><strong>Fair price</strong><p>Price reflects usable depth, saved time, clarity, and support—not page count alone.</p></div>
        <div><strong>Tested delivery</strong><p>A real purchase reaches the correct private file on mobile and desktop.</p></div>
      </div>
      <Link className="button inline-button" href="/products">Review every product</Link>
    </section>

    <section className="card section-block">
      <p className="eyebrow">Customer care</p><h2>Exception playbook</h2>
      <div className="table-wrap"><table><thead><tr><th>Situation</th><th>Response</th></tr></thead><tbody>
        {supportSop.map(([situation, response]) => <tr key={situation}><th>{situation}</th><td>{response}</td></tr>)}
      </tbody></table></div>
    </section>

    <section className="grid two-grid section-block">
      <article className="card">
        <p className="eyebrow">Marketing</p><h2>One honest growth loop</h2>
        <ol className="spaced-list">
          <li>Collect real customer questions and objections.</li>
          <li>Publish one useful answer in the Kunta Naturals voice.</li>
          <li>Route it to one relevant free or paid offer.</li>
          <li>Capture explicit email consent.</li>
          <li>Deliver value, make opting out easy, and request feedback.</li>
          <li>Improve the product and procedure from evidence.</li>
        </ol>
      </article>
      <article className="card">
        <p className="eyebrow">Automation</p><h2>What AI may do</h2>
        <p><strong>Execute:</strong> reversible checks, summaries, drafts saved privately, analytics reports, broken-link scans.</p>
        <p><strong>Draft for approval:</strong> campaigns, product copy, support replies, price recommendations, public posts.</p>
        <p><strong>Owner only:</strong> money movement, refunds, legal acceptance, account access, final public claims, customer commitments, deletion, and secrets.</p>
      </article>
    </section>

    <section className="card section-block">
      <p className="eyebrow">Scorecard</p><h2>Measure outcomes, not busyness</h2>
      <div className="table-wrap"><table><thead><tr><th>Metric</th><th>Definition/source</th><th>Review</th><th>Question</th></tr></thead><tbody>
        {scorecard.map(([metric, source, review, question]) => <tr key={metric}><th>{metric}</th><td>{source}</td><td>{review}</td><td>{question}</td></tr>)}
      </tbody></table></div>
    </section>

    <section className="card section-block">
      <p className="eyebrow">30-day focus</p><h2>Only three priorities</h2>
      <div className="quality-grid">
        <div><strong>1. Prove delivery</strong><p>Owner · 7 days · Target: 100% successful test emails and paid-file test delivery.</p></div>
        <div><strong>2. Prove one offer</strong><p>Owner · 14 days · Target: ten qualified conversations and evidence-based objections for the $9 guide.</p></div>
        <div><strong>3. Improve one funnel leak</strong><p>Owner · 30 days · Target: one measured improvement in signup, checkout, or fulfillment—not simultaneous redesigns.</p></div>
      </div>
    </section>

    <section className="notice section-block">
      <strong>Emergency stop rule:</strong> pause paid promotion or checkout when delivery fails, a product is materially incomplete, a claim cannot be supported, refunds spike, or customer safety is uncertain. Preserve records, tell the truth, fix the cause, retest, then resume.
    </section>
  </main>;
}
