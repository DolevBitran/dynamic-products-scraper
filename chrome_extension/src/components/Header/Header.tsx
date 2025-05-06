import kspLogo from '@assets/KSP.png'

const Header = () => {

    return (
        <header className="bg-gradient-to-r from-[#9b87f5] to-[#7E69AB] p-4 flex items-center justify-between">
            <div className="flex items-center">
                <div className="w-10 h-10 bg-white rounded-full overflow-hidden flex items-center justify-center mr-3 shadow-md">
                    <img
                        src={kspLogo}
                        alt="KSP Logo"
                        className="w-8 h-8 object-contain"
                    />
                </div>
                <div className="text-start">
                    <h1 className="text-white font-semibold text-sm">Dynamic Scraper</h1>
                    <p className="text-white/80 text-xs">Products Scraper</p>
                </div>
            </div>
        </header >
    );
};

export default Header;