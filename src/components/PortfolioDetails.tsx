// "use client";

// import { useState, useEffect } from 'react';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// // Helper to format currency
// const formatCurrency = (value: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value);

// // --- TYPE DEFINITIONS ---
// interface Transaction {
//     date: string;
//     description: string;
//     amount: number | null;
//     units: number | null;
//     nav: number | null;
//     balance: number | null;
//     type: string;
// }
// interface SchemeInfo {
//   name: string;
//   isin: string;
// }
// interface PortfolioDetailsProps {
//   schemes: SchemeInfo[];
// }

// export function PortfolioDetails({ schemes }: PortfolioDetailsProps) {
//   const [selectedIsin, setSelectedIsin] = useState<string | null>(null);
//   const [transactions, setTransactions] = useState<Transaction[]>([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     if (!selectedIsin) {
//       setTransactions([]);
//       return;
//     }

//     const fetchTransactions = async () => {
//       setIsLoading(true);
//       setError(null);
//       try {
//         const response = await fetch(`/api/portfolio/transactions/${selectedIsin}`);
//         if (!response.ok) {
//           throw new Error(`Failed to fetch transactions for ${selectedIsin}`);
//         }
//         const data: Transaction[] = await response.json();
//         setTransactions(data);
//       } catch (e) {
//         setError(e instanceof Error ? e.message : "An unknown error occurred.");
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchTransactions();
//   }, [selectedIsin]);

//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle>Scheme Transaction Details</CardTitle>
//         <CardDescription>Select a scheme to view its detailed transaction history.</CardDescription>
//       </CardHeader>
//       <CardContent className="space-y-6">
//         <Select onValueChange={setSelectedIsin}>
//           <SelectTrigger className="w-full md:w-1/2">
//             <SelectValue placeholder="Select a scheme..." />
//           </SelectTrigger>
//           <SelectContent>
//             {schemes.map((scheme, index) => (
//               <SelectItem key={`${scheme.isin}-${index}`} value={scheme.isin}>
//                 {scheme.name}
//               </SelectItem>
//             ))}
//           </SelectContent>
//         </Select>

//         {selectedIsin && (
//           <div className="overflow-x-auto">
//             <Table>
//               <TableHeader>
//                 <TableRow>
//                   <TableHead>Date</TableHead>
//                   <TableHead>Description</TableHead>
//                   <TableHead className="text-right">Amount</TableHead>
//                   <TableHead className="text-right">Units</TableHead>
//                   <TableHead className="text-right">NAV</TableHead>
//                   <TableHead className="text-right">Balance</TableHead>
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//                 {isLoading ? (
//                   <TableRow>
//                     <TableCell colSpan={6} className="text-center">Loading transactions...</TableCell>
//                   </TableRow>
//                 ) : error ? (
//                   <TableRow>
//                     <TableCell colSpan={6} className="text-center text-red-600">{error}</TableCell>
//                   </TableRow>
//                 ) : transactions.length > 0 ? (
//                   transactions.map((tx, index) => (
//                     <TableRow key={index}>
//                       <TableCell>{tx.date}</TableCell>
//                       <TableCell>{tx.description}</TableCell>
//                       <TableCell className="text-right">{tx.amount ? formatCurrency(tx.amount) : '-'}</TableCell>
//                       <TableCell className="text-right">{tx.units?.toFixed(3) || '-'}</TableCell>
//                       <TableCell className="text-right">{tx.nav?.toFixed(3) || '-'}</TableCell>
//                       <TableCell className="text-right">{tx.balance?.toFixed(3) || '-'}</TableCell>
//                     </TableRow>
//                   ))
//                 ) : (
//                   <TableRow>
//                     <TableCell colSpan={6} className="text-center">No transactions found for this scheme.</TableCell>
//                   </TableRow>
//                 )}
//               </TableBody>
//             </Table>
//           </div>
//         )}
//       </CardContent>
//     </Card>
//   );
// }