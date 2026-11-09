import { useMemo, useState } from "react";
import { useCustom } from "@refinedev/core";
import { useEffect } from "react";
import { Accordion, AccordionDetails, AccordionSummary, Alert, Box, Button, Card, CardActionArea, CardContent, Chip, Divider, LinearProgress, Link, MenuItem, Skeleton, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from "@mui/material";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import ArrowOutwardRoundedIcon from "@mui/icons-material/ArrowOutwardRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import { PageContainer } from "../../components/PageContainer";
import { parseDashboard, type Dashboard } from "../../services/dashboard";
import { getDashboardRate, type DashboardCurrency, type DashboardRate } from "../../services/dashboardCurrency";

const meta={kind:"function",async:false} as const;
const queryOptions={retry:false,refetchOnWindowFocus:true};
// The server parameter selects a ledger, not a presentation currency.
const dashboardConfig={payload:{currency:"INR"}};
const dateFormat=new Intl.DateTimeFormat("en-US",{month:"short",day:"2-digit",year:"numeric",timeZone:"UTC"});
const orderStatusColor = (status: string) => {
 if (status === "pending") return "warning";
 if (status === "shipped" || status === "delivered" || status === "completed") return "success";
 if (status === "cancelled") return "error";
 if (status === "processing" || status === "confirmed") return "info";
 return "default";
};
function PanelHeading({title,href,action}:{title:string;href?:string;action?:string}){
 return <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2} sx={{pb:2,mb:2,borderBottom:1,borderColor:"divider"}}>
   <Typography variant="h5" component="h2">{title}</Typography>{href&&<Link href={href} underline="hover" variant="body2" sx={{flexShrink:0,display:"inline-flex",alignItems:"center",minHeight:44}}>{action}<ArrowOutwardRoundedIcon sx={{fontSize:16,ml:.5}}/></Link>}
 </Stack>;
}
export const Home=()=>{
 const [currency,setCurrency]=useState<DashboardCurrency>("INR");
 const {result,query}=useCustom<Dashboard>({url:"hmg-dashboard-v1",method:"post",dataProviderName:"app",meta,config:dashboardConfig,queryOptions,errorNotification:false});
 const projection=parseDashboard(result?.data);
 const d=projection?.currency==="INR" ? projection : null;
 const [fx,setFx]=useState<{currency:DashboardCurrency;status:"loading"|"ready"|"error";value?:DashboardRate}>({currency:"INR",status:"ready"});
 const [rateAttempt,setRateAttempt]=useState(0);
 const canConvert=Boolean(d)&&!query.isError&&!query.isLoading;
 useEffect(()=>{
  if(currency==="INR"||!canConvert)return;
  const controller=new AbortController();let active=true;
  setFx({currency,status:"loading"});
  void getDashboardRate(currency,controller.signal).then(value=>{
   if(active)setFx({currency,status:"ready",value});
  }).catch(()=>{if(active)setFx({currency,status:"error"});});
  // Refresh public data while open; a failed refresh never keeps stale amounts.
  const refresh=setTimeout(()=>{setFx({currency,status:"loading"});setRateAttempt(n=>n+1);},300_000);
  return ()=>{active=false;controller.abort();clearTimeout(refresh);};
 },[currency,canConvert,rateAttempt]);
 const currentFx=fx.currency===currency?fx:null;
 const rate=currency==="INR"?1:currentFx?.status==="ready"?currentFx.value?.rate:undefined;
 const moneyFormat=useMemo(()=>new Intl.NumberFormat("en-IN",{style:"currency",currency,maximumFractionDigits:2}),[currency]);
 const compactMoneyFormat=useMemo(()=>new Intl.NumberFormat("en-IN",{style:"currency",currency,maximumFractionDigits:1,notation:"compact"}),[currency]);
 const money=(value:string|number,compact=false)=>{
  const converted=rate===undefined?NaN:Number(value)*rate;
  return Number.isFinite(converted)?(compact?compactMoneyFormat:moneyFormat).format(converted):"Amount unavailable";
 };
 const title=<Stack direction={{xs:"column",sm:"row"}} spacing={2} justifyContent="space-between" alignItems={{xs:"stretch",sm:"center"}}>
  <Box><Typography variant="caption" color="text.secondary">Workspace overview</Typography><Typography variant="h2" component="h1" sx={{mt:.5}}>Dashboard</Typography><Typography variant="body2" color="text.secondary" sx={{mt:.75}}>Inventory, orders and financial priorities.</Typography></Box>
  <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" alignItems="center">
   {d?.generated_at&&<Typography variant="caption" color="text.secondary" sx={{display:{xs:"none",lg:"block"},mr:1}}>{dateFormat.format(new Date(d.generated_at))}</Typography>}
   <TextField select size="small" label="Display currency" value={currency} onChange={e=>{if(["INR","USD","EUR"].includes(e.target.value)){const next=e.target.value as DashboardCurrency;setFx({currency:next,status:"loading"});setCurrency(next);}}} sx={{minWidth:150}}>{["INR","USD","EUR"].map(c=><MenuItem key={c} value={c}>{c}</MenuItem>)}</TextField>
   <Button variant="outlined" startIcon={<RefreshRoundedIcon/>} onClick={()=>void query.refetch()} disabled={query.isFetching}>Refresh</Button>
   <Button href="/orders" variant="contained" endIcon={<ArrowOutwardRoundedIcon/>}>Orders</Button>
  </Stack>
 </Stack>;
 if(query.isLoading)return <PageContainer><Stack spacing={3}>{title}<Skeleton variant="rounded" height={120}/><Skeleton variant="rounded" height={160}/><Skeleton variant="rounded" height={280}/></Stack></PageContainer>;
 if(query.isError||!d?.ok)return <PageContainer><Stack spacing={3}>{title}<Alert severity="warning" action={<Button onClick={()=>void query.refetch()}>Retry</Button>}>Dashboard data unavailable</Alert><Typography color="text.secondary">Taruvi could not return the complete authorized projection. No totals have been substituted. You can still open modules from the sidebar.</Typography></Stack></PageContainer>;
 const tiles=[
  {label:"Total Products",value:String(d.product_count),context:`${d.category_count} Categories · ${d.location_count} Locations`,href:"/inventory"},
  {label:"Inventory Value",value:money(d.inventory_value,true),context:`at selling price · ${currency}`,href:"/inventory"},
  {label:"Pending Orders",value:String(d.pending_orders),context:`${d.order_count} Orders · all time`,href:"/orders"},
  {label:"Revenue This Month",value:money(d.revenue_month,true),context:`Shipped / delivered · ${currency}`,href:"/orders"},
 ];
 return <PageContainer><Stack spacing={2.5}>
  {title}
  <Box aria-live="polite">
   {currency==="INR"?<Alert severity="info">INR ledger · Recorded INR amounts. Counts and records are restricted to this ledger; other currency ledgers are not included.</Alert>:
    currentFx?.status==="ready"?<Alert severity="info">INR ledger · Display currency {currency} · Reference date {currentFx.value?.date}. Indicative conversion only, not an accounting rate. Source: <Link href="https://frankfurter.dev/" target="_blank" rel="noopener noreferrer">Frankfurter (ECB)</Link>. Counts and records remain unchanged.</Alert>:
    currentFx?.status==="error"?<Alert severity="warning" action={<Button onClick={()=>{setFx({currency,status:"loading"});setRateAttempt(n=>n+1);}}>Retry rate</Button>}>INR ledger · {currency} reference rate unavailable. Amounts are unavailable; counts and records remain unchanged.</Alert>:
    <Alert severity="info" aria-busy="true">INR ledger · Loading {currency} reference rate. Amounts are unavailable; counts and records remain unchanged.</Alert>}
  </Box>
  {query.isFetching&&<LinearProgress aria-label="Refreshing dashboard"/>}
  <Box aria-label="Key performance indicators" sx={{display:"grid",gap:2,gridTemplateColumns:{xs:"minmax(0,1fr)",sm:"repeat(2,minmax(0,1fr))",xl:"repeat(4,minmax(0,1fr))"}}}>
   {tiles.map(tile=><Card key={tile.label}><CardActionArea href={tile.href} aria-label={`${tile.label}: ${tile.value}. ${tile.context}`} sx={{height:"100%","&:focus-visible":{outlineOffset:-3}}}><CardContent><Typography variant="body2" color="text.secondary">{tile.label}</Typography><Typography variant="h2" component="p" sx={{my:1.5,fontVariantNumeric:"tabular-nums"}}>{tile.value}</Typography><Typography variant="caption" color="text.secondary">{tile.context}</Typography></CardContent></CardActionArea></Card>)}
  </Box>
  <Card><CardContent><PanelHeading title="Replenishment" href="/inventory" action="View inventory"/>
   {!d.low_stock.length?<Stack alignItems="center" sx={{py:3}}><Typography color="text.secondary">{d.product_count ? "All products are well stocked" : "No products in the INR ledger yet"}</Typography><Typography variant="caption" color="text.secondary">Based on current stock and minimum quantities.</Typography></Stack>:
   <Box sx={{overflowX:"auto"}}><Table size="small"><TableHead><TableRow><TableCell>Product</TableCell><TableCell>SKU</TableCell><TableCell align="right">Stock</TableCell><TableCell align="right">Minimum</TableCell><TableCell align="right">Action</TableCell></TableRow></TableHead><TableBody>{d.low_stock.map(p=><TableRow key={p.id}><TableCell>{p.name}</TableCell><TableCell>{p.sku}</TableCell><TableCell align="right">{p.stock}</TableCell><TableCell align="right">{p.minimum}</TableCell><TableCell align="right"><Link href={`/inventory/show/${p.id}`}>View product</Link></TableCell></TableRow>)}</TableBody></Table><Typography variant="caption" color="text.secondary">{d.low_stock_count} products at or below minimum stock</Typography></Box>}
  </CardContent></Card>
  <Box sx={{display:"grid",gridTemplateColumns:{xs:"minmax(0,1fr)",lg:"repeat(2,minmax(0,1fr))"},gap:2}}>
   <Card sx={{gridColumn:"1 / -1",minWidth:0}}><CardContent><PanelHeading title="Recent Orders" href="/orders" action="All orders"/>
    <Box sx={{overflowX:"auto"}}><Table size="small"><TableHead><TableRow><TableCell>Order / Customer</TableCell><TableCell>Status</TableCell><TableCell>Date</TableCell><TableCell align="right">Total</TableCell></TableRow></TableHead><TableBody>
     {d.recent_orders.map(o=><TableRow key={o.id}><TableCell><Link href={`/orders/show/${o.id}`}>{o.order_number}</Link><Typography variant="caption" component="div" color="text.secondary">{o.customer_name}</Typography></TableCell><TableCell><Chip size="small" label={o.status} color={orderStatusColor(o.status)}/></TableCell><TableCell sx={{whiteSpace:"nowrap"}}>{o.order_date?dateFormat.format(new Date(o.order_date)):"Not recorded"}</TableCell><TableCell align="right" sx={{whiteSpace:"nowrap",fontVariantNumeric:"tabular-nums"}}>{money(o.total)}</TableCell></TableRow>)}
     {!d.recent_orders.length&&<TableRow><TableCell colSpan={4}>No orders in the INR ledger yet.</TableCell></TableRow>}
    </TableBody></Table></Box><Typography variant="caption" color="text.secondary">{d.recent_orders.length} / {d.order_count} Orders</Typography>
   </CardContent></Card>
   <Card><CardContent><PanelHeading title="Stock Value by Category"/><Typography variant="caption" color="text.secondary">at selling price · {currency}</Typography>
    <Stack spacing={2.5} sx={{mt:2}}>{d.stock_by_category.map(c=><Box key={c.name}><Stack direction="row" justifyContent="space-between" spacing={1}><Typography variant="body2" sx={{overflowWrap:"anywhere"}}>{c.name}</Typography><Typography variant="body2" sx={{fontVariantNumeric:"tabular-nums",flexShrink:0}}>{money(c.value)}</Typography></Stack><LinearProgress aria-label={`${c.name} share of stock value`} variant="determinate" value={Number(d.inventory_value)>0?Math.max(0,Math.min(100,Number(c.value)/Number(d.inventory_value)*100)):0} sx={{mt:1}}/></Box>)}
     {!d.stock_by_category.length&&<Typography color="text.secondary">No stock value available.</Typography>}</Stack>
    <Divider sx={{my:2}}/><Stack direction="row" justifyContent="space-between"><Typography variant="caption">{d.product_count} products · {currency}</Typography><Typography variant="caption">{money(d.inventory_value)}</Typography></Stack>
   </CardContent></Card>
   <Card><CardContent><PanelHeading title="Financial watch" href="/reports" action="Reports"/>
    <Typography variant="caption" color="text.secondary">Outstanding order balances</Typography><Typography variant="h4" component="p" sx={{my:1,fontVariantNumeric:"tabular-nums"}}>{money(d.receivables,true)}</Typography><Typography variant="caption" color="text.secondary">Non-cancelled orders less payments · {currency}</Typography>
    <Divider sx={{my:2}}/><Typography variant="h6" component="h3" sx={{mb:2}}>Quick Actions</Typography>
    <Box sx={{display:"grid",gridTemplateColumns:{xs:"minmax(0,1fr)",sm:"repeat(2,minmax(0,1fr))"},gap:2}}>
     {[["Add Product","/inventory/create"],["Stock Adjustments","/stock-adjustments"],["Stock Transfers","/stock-transfers"],["Import / Export","/import-export"]].map(([label,href])=><Button key={href} href={href} variant="outlined" endIcon={<ArrowOutwardRoundedIcon/>} sx={{justifyContent:"space-between",minHeight:44,textAlign:"left"}}>{label}</Button>)}
    </Box>
   </CardContent></Card>
  </Box>
  <Accordion disableGutters><AccordionSummary expandIcon={<ExpandMoreRoundedIcon/>}><Typography variant="h6">Recent Products</Typography><Chip size="small" label={d.recent_products.length} sx={{ml:1}}/></AccordionSummary><AccordionDetails><Box sx={{overflowX:"auto"}}><Table size="small"><TableHead><TableRow><TableCell>SKU</TableCell><TableCell>Product</TableCell><TableCell align="right">Stock</TableCell></TableRow></TableHead><TableBody>{d.recent_products.map(p=><TableRow key={p.id}><TableCell>{p.sku}</TableCell><TableCell><Link href={`/inventory/show/${p.id}`}>{p.name}</Link></TableCell><TableCell align="right">{p.stock}</TableCell></TableRow>)}{!d.recent_products.length&&<TableRow><TableCell colSpan={3}>No recent products in the INR ledger yet.</TableCell></TableRow>}</TableBody></Table></Box></AccordionDetails></Accordion>
  {d.limitations?.length ? <Typography variant="caption" color="text.secondary">{d.limitations.join(" ")}</Typography> : null}
  <Stack direction={{xs:"column",sm:"row"}} justifyContent="space-between" spacing={1} sx={{pt:2,borderTop:1,borderColor:"divider"}}><Typography variant="caption" color="text.secondary">HMG Stones · Demonstration workspace · Not production business data</Typography><Link href="/settings/account" variant="caption">Account preferences</Link></Stack>
 </Stack></PageContainer>;
};
