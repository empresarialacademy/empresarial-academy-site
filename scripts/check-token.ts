import { getPayloadClient } from '../src/lib/payload';

async function run() {
  // @ts-expect-error - ads-settings not yet in generated types
  const settings = await payload.findGlobal({ slug: 'ads-settings' as any });
  console.log('Ads Settings:', settings);
  process.exit(0);
}

run();
