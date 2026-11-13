"""Pure cross-app reference planner; no stock/price guesses or name-only merges."""
import re
from uuid import UUID, NAMESPACE_URL, uuid5
from urllib.parse import urlsplit

def plan_stones_catalogue(options, organization_id, verified_images, existing, existing_categories=()):
    UUID(organization_id)
    products=[];categories={};seen=set();sources=set();slugs={}
    for option in options:
        if option.get('data',{}).get('kind')!='official_stone':continue
        if option.get('status')!='Official reference':raise ValueError('Unapproved material status')
        material=option['data']['material'];source_id=str(UUID(option['id']))
        if source_id in seen:raise ValueError('Duplicate source identity')
        seen.add(source_id)
        source=material['sourcePageUrl'];url=urlsplit(source)
        if source in sources:raise ValueError('Duplicate provenance URL')
        sources.add(source)
        if url.scheme!='https' or url.netloc!='www.hmgstones.com' or not url.path.startswith('/product/') or url.query or url.fragment:
            raise ValueError('Unverified provenance URL')
        digest=material['sha256']
        if not re.fullmatch('[0-9a-f]{64}',digest):raise ValueError('Invalid media digest')
        image=verified_images.get(digest)
        if not image or not image.startswith('storage://products/') or len(image)>255 or '..' in image:
            raise ValueError('No verified Studio-owned image')
        name=material['title'].strip();category=material['category'].strip()
        if not name or len(name)>255 or not category:raise ValueError('Invalid catalogue name')
        category_key=category.casefold()
        cid=str(uuid5(NAMESPACE_URL,'hmg-studio/stones-category/'+organization_id+'/'+category_key))
        slug='stones-'+re.sub('[^a-z0-9]+','-',category_key).strip('-')
        if slug in slugs and slugs[slug]!=cid:raise ValueError('Category slug collision')
        if any(c.get('organization_id')==organization_id and c.get('slug')==slug for c in existing_categories):
            raise ValueError('Existing category requires reconciliation')
        slugs[slug]=cid
        categories[cid]={'id':cid,'organization_id':organization_id,'name':category,
                         'slug':slug,'is_active':True}
        pid=str(uuid5(NAMESPACE_URL,'hmg-studio/stones-reference/'+organization_id+'/'+source_id))
        sku='HMG-REF-'+UUID(source_id).hex.upper()
        if any(r.get('id')==pid or (r.get('organization_id')==organization_id and
               (r.get('sku')==sku or source in (r.get('notes') or ''))) for r in existing):
            raise ValueError('Existing identity requires explicit reconciliation')
        products.append({'id':pid,'organization_id':organization_id,'sku':sku,'name':name,
            'description':material.get('description',''),'category_id':cid,'image':image,
            'notes':'REFERENCE ONLY — no verified stock or commercial price. Legacy price=0 is a schema placeholder. '
                    +'Source app: hmg_stones; option: '+source_id+'; material SKU: '+str(material.get('sku',''))+'; Source: '+source,
            'price':0,'selling_price':None,'purchase_price':None,'stock':0,'min_stock':0,
            'currency':'INR','is_active':False,'has_variants':False,'tracking_type':'none','type':'standard'})
    return {'product_categories':list(categories.values()),'products':products}
