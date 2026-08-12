      <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 flex items-center space-x-3">
          <img
            src={listing.photos[0]}
            alt={listing.title}
            referrerPolicy="no-referrer"
            className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
          />
          <div>
            <h4 className="font-bold text-xs line-clamp-1">{listing.title}</h4>
            <p className="text-[11px] text-stone-500">{listing.city}, Texas • ${listing.nightlyPrice}/night</p>
            <span className="text-[10px] text-amber-700 dark:text-amber-400 font-bold block mt-1">
              thikabnbs.com
            </span>
          </div>
        </div>
