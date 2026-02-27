import React from 'react';
import { Skeleton } from '../../components/ui/skeleton';

export function AssetHomeTP() {
	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
			<div className="max-w-4xl mx-auto space-y-6">
				<div className="flex items-center justify-between">
					<div>
						<Skeleton className="h-8 w-48 rounded" />
						<Skeleton className="h-6 w-32 mt-3 rounded" />
					</div>
					<div className="flex items-center gap-3">
						<Skeleton className="h-10 w-28 rounded" />
						<Skeleton className="h-10 w-28 rounded" />
					</div>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					<Skeleton className="h-40 w-full rounded-lg" />
					<Skeleton className="h-40 w-full rounded-lg" />
					<Skeleton className="h-40 w-full rounded-lg" />
				</div>

				<div>
					<Skeleton className="h-6 w-40 rounded" />
					<div className="mt-3 space-y-3">
						{[1,2,3,4].map((i) => (
							<Skeleton key={i} className="h-12 w-full rounded-xl" />
						))}
					</div>
				</div>

				<p className="text-sm text-gray-400">正在加载资产数据…</p>
			</div>
		</div>
	);
}


