// Flows between companies, recorded as videos with both screens side by side: the seller on the
// left, the buyer on the right. Recorded after every screenshot, so what they do shows in no picture.
import type { Page } from 'playwright';
import type { Scenario } from '../scenario';

/**
 * In-app navigation, as capture's own `go`: React Router follows popstate, so no reload. Through a
 * route that matches nothing first, so the page mounts fresh and no panel stays open from before.
 */
const open = async (page: Page, path: string) => {
  for (const to of ['/__handbook__', path]) {
    await page.evaluate((p) => { window.history.pushState({}, '', p); window.dispatchEvent(new PopStateEvent('popstate')); }, to);
    await page.waitForTimeout(50);
  }
  await page.waitForTimeout(800);
};
const button = (page: Page, name: string | RegExp) => page.getByRole('button', { name }).last();
/** A beat after each action, so a viewer sees what changed before the next one. */
const beat = (page: Page) => page.waitForTimeout(900);
const confirm = async (page: Page, name: string) => { await page.getByRole('dialog').getByRole('button', { name, exact: true }).click(); await page.waitForTimeout(800); };
const pick = async (page: Page, label: string, search: string, option: string | RegExp) => {
  await page.getByRole('textbox', { name: label }).click();
  if (search) await page.getByRole('textbox', { name: label }).fill(search);
  await page.getByRole('option', { name: option }).first().click();
};

// From seed:trade: Ikeja Hardware's account with Lagos Industrial allows bank transfer, and the
// breaker (LIS-IC60-32) is in stock at its contract price.
const quoteToCash: Scenario = {
  kind: 'video',
  id: 'quote-to-cash',
  persona: 'distributor',
  path: '/selling/orders',
  with: { persona: 'reseller', path: '/buying/orders' },
  title: 'One order from offer to payment: the seller on the left, the buyer on the right',
  steps: async (seller, say, buyer) => {
    const b = buyer!;
    await say('Ikeja Hardware drafts an order to Lagos Industrial, priced at its own terms.');
    await b.getByRole('button', { name: 'New order' }).click();
    await beat(b);
    await pick(b, 'Supplier', '', 'Lagos Industrial Supplies Ltd');
    await beat(b);
    await pick(b, 'Offer 1', 'iC60', /iC60/i);
    await beat(b);
    await b.getByRole('textbox', { name: 'Quantity' }).fill('10');
    await pick(b, 'How you pay', '', 'Bank transfer');
    await beat(b);
    await button(b, 'Create draft').click();
    await beat(b);
    await b.waitForURL(/[?&]order=/);
    const orderId = new URL(b.url()).searchParams.get('order')!;

    await say('It submits the order. Lagos Industrial hears of it at once.');
    await button(b, 'Submit').click();
    await beat(b);
    await confirm(b, 'Submit');
    await beat(b);
    await open(seller, `/selling/orders?order=${orderId}`);
    await beat(seller);

    await say('Lagos Industrial accepts: the stock is reserved for Ikeja Hardware.');
    await button(seller, 'Accept').click();
    await beat(seller);
    await confirm(seller, 'Accept');
    await beat(seller);

    await say('It picks and packs from what was reserved, then dispatches with a tracking reference.');
    await button(seller, 'Start a shipment').click();
    await beat(seller);
    await button(seller, 'Pack').click();
    await beat(seller);
    await button(seller, 'Confirm packed').click();
    await beat(seller);
    await seller.waitForTimeout(600);
    await button(seller, 'Dispatch').click();
    await beat(seller);
    await seller.getByRole('textbox', { name: 'Tracking reference' }).fill('LIS-TRK-0520');
    await button(seller, 'Dispatch').click();
    await beat(seller);
    await seller.waitForTimeout(800);

    await say('Delivered, with the signed delivery note as proof. The invoice was issued on dispatch.');
    const chooser = seller.waitForEvent('filechooser');
    await button(seller, 'Add proof').click();
    await beat(seller);
    await (await chooser).setFiles({ name: 'signed-delivery-note.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4\n% Neuros demo delivery note\n%%EOF\n') });
    await beat(seller);
    await seller.getByRole('button', { name: 'Delivered' }).last().click({ timeout: 10_000 });
    await beat(seller);
    await confirm(seller, 'Delivered');
    await beat(seller);

    await say('Ikeja Hardware confirms it received the goods.');
    await open(b, `/buying/orders?order=${orderId}`);
    await beat(b);
    await b.getByRole('button', { name: /^DN-/ }).first().click();
    await beat(b);
    await button(b, 'Confirm receipt').click();
    await beat(b);
    await confirm(b, 'Confirm');
    await beat(b);

    await say('It pays by bank transfer and tells Lagos Industrial, with the bank reference.');
    await open(b, `/buying/orders?order=${orderId}`);
    await beat(b);
    const total = (await b.locator('aside').innerText()).match(/Total\s+₦\s?([\d,]+\.\d{2})/)?.[1]?.replace(/,/g, '') ?? '0';
    await button(b, 'I have paid').click();
    await beat(b);
    await b.getByRole('textbox', { name: 'Amount paid' }).fill(total);
    await b.getByRole('textbox', { name: 'Bank reference' }).fill('IH-TRF-0520');
    await button(b, 'Send').click();
    // The notice is saved before the seller looks for it.
    await b.getByText('The seller is told you paid').first().waitFor({ timeout: 15_000 });
    await beat(b);

    await say('Lagos Industrial checks its bank and confirms: the invoice is paid and the order complete.');
    await open(seller, `/selling/orders?order=${orderId}`);
    await beat(seller);
    await seller.getByRole('button', { name: 'Confirm received' }).first().click({ timeout: 15_000 });
    await beat(seller);
    await button(seller, 'Confirm received').click();
    await beat(seller);
    await seller.waitForTimeout(1500);
  },
};

export default [quoteToCash];
