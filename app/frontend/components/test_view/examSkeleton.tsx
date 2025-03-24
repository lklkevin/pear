import { Skeleton } from "../ui/skeleton";

export default function ExamSkeleton() {
  return (
    <div className="w-full max-w-7xl mx-auto">
      <Skeleton className="h-7 w-20 mb-4"></Skeleton>
      <Skeleton className="h-[2.25rem] sm:h-[3rem] w-1/3"></Skeleton>
      <div className="flex flex-col mt-2 sm:mt-4 mb-4 sm:mb-8 gap-3">
        <Skeleton className="h-[1.25rem] sm:h-[1.5rem] w-3/4"></Skeleton>
      </div>
      <div className="flex items-center justify-between mb-8 sm:mb-12">
        <Skeleton className=" w-[196px] h-[44px]"></Skeleton>
        <Skeleton className=" w-[44px] sm:w-[134px] h-[44px]"></Skeleton>
      </div>
      <div className="space-y-6 sm:space-y-8">
        <div>
          <Skeleton className="h-[1.75rem] mb-2 sm:mb-4 w-1/5"></Skeleton>
          <Skeleton className="h-[123px] w-full"></Skeleton>
        </div>
        <div>
          <Skeleton className="h-[1.75rem] mb-2 sm:mb-4 w-1/5"></Skeleton>
          <Skeleton className="h-[123px] w-full"></Skeleton>
        </div>
        <div>
          <Skeleton className="h-[1.75rem] mb-2 sm:mb-4 w-1/5"></Skeleton>
          <Skeleton className="h-[123px] w-full"></Skeleton>
        </div>
        <div>
          <Skeleton className="h-[1.75rem] mb-2 sm:mb-4 w-1/5"></Skeleton>
          <Skeleton className="h-[123px] w-full"></Skeleton>
        </div>
        <div>
          <Skeleton className="h-[1.75rem] mb-2 sm:mb-4 w-1/5"></Skeleton>
          <Skeleton className="h-[123px] w-full"></Skeleton>
        </div>
      </div>
    </div>
  );
}
