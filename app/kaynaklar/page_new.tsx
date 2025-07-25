'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/src/contexts/LanguageContext';
import { useAuth } from 'src/context/AuthContext';
import Link from 'next/link';

// Kaynak kategorileri
const categories = [
  'Ders Notları',
  'Kitaplar',
  'Makaleler',
  'Videolar',
  'Sunumlar',
  'Sınav Soruları',
  'Projeler',
  'Diğer'
];

// Örnek kaynak formatları
const formats = [
  'PDF',
  'DOC/DOCX',
  'PPT/PPTX',
  'XLS/XLSX',
  'Video',
  'Ses',
  'Resim',
  'Link',
  'Diğer'
];

// Üniversite seçenekleri - Bunlar örnek olarak eklenmiştir, gerçek verilerle değiştirilmelidir
const universities = ['İstanbul Üniversitesi', 'Ankara Üniversitesi', 'Boğaziçi Üniversitesi', 'ODTÜ', 'İTÜ', 'Ege Üniversitesi', 'Hacettepe Üniversitesi'];

// Kaynak tipi tanımlama
type Resource = {
  id: number;
  title: string;
  description: string;
  author: string;
  category: string;
  format: string;
  university: string;
  department: string;
  uploadDate: string;
  downloadCount: number;
  viewCount: number;
  fileSize: string;
  tags: string[];
  url: string;
};

export default function KaynaklarPage() {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const [resources, setResources] = useState<Resource[]>([]);
  const [filteredResources, setFilteredResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('');
  const [selectedUniversity, setSelectedUniversity] = useState<string>('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showFilters, setShowFilters] = useState(false);

  // Kaynakları getir
  useEffect(() => {
    const fetchResources = async () => {
      setLoading(true);
      try {
        // Normalde burada API'den kaynakları çekerdik
        // Şimdilik localStorage'dan okuyoruz
        const storedResources = localStorage.getItem('sharedResources');
        if (storedResources) {
          const parsedResources = JSON.parse(storedResources) as Resource[];
          setResources(parsedResources);
        } else {
          setResources([]);
        }
      } catch (error) {
        console.error('Kaynaklar yüklenirken hata oluştu:', error);
        setResources([]);
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, []);

  // Kaynakları filtrele
  useEffect(() => {
    let result = resources;
    
    // Arama terimine göre filtrele
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        resource => 
          resource.title.toLowerCase().includes(term) || 
          resource.description.toLowerCase().includes(term) || 
          resource.author.toLowerCase().includes(term) ||
          resource.tags.some(tag => tag.toLowerCase().includes(term))
      );
    }
    
    // Kategoriye göre filtrele
    if (selectedCategory) {
      result = result.filter(resource => resource.category === selectedCategory);
    }
    
    // Formata göre filtrele
    if (selectedFormat) {
      result = result.filter(resource => resource.format === selectedFormat);
    }
    
    // Üniversiteye göre filtrele
    if (selectedUniversity !== 'all') {
      result = result.filter(resource => resource.university === selectedUniversity);
    }
    
    // Sıralama
    result = [...result].sort((a, b) => {
      if (sortBy === 'date') {
        return sortOrder === 'asc' 
          ? new Date(a.uploadDate).getTime() - new Date(b.uploadDate).getTime()
          : new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
      } else if (sortBy === 'downloads') {
        return sortOrder === 'asc' 
          ? a.downloadCount - b.downloadCount
          : b.downloadCount - a.downloadCount;
      } else if (sortBy === 'views') {
        return sortOrder === 'asc' 
          ? a.viewCount - b.viewCount
          : b.viewCount - a.viewCount;
      } else if (sortBy === 'title') {
        return sortOrder === 'asc'
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title);
      }
      return 0;
    });
    
    setFilteredResources(result);
  }, [resources, searchTerm, selectedCategory, selectedFormat, selectedUniversity, sortBy, sortOrder]);

  // Formatı insan tarafından okunabilir hale getir
  const formatFileSize = (sizeInMB: string): string => {
    const size = parseFloat(sizeInMB);
    if (size < 1) {
      return `${(size * 1000).toFixed(0)} KB`;
    }
    return `${size.toFixed(1)} MB`;
  };

  // Tarihi formatla
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(language === 'tr' ? 'tr-TR' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#994D1C] mb-2">{t('nav.resources')}</h1>
          <p className="text-[#6B3416] mb-4">
            {t('general.allResources')}
          </p>
        </div>
        
        {user && (
          <Link
            href="/kaynaklar/paylas"
            className="px-6 py-3 bg-gradient-to-r from-[#FFB996] to-[#FF8B5E] text-white font-medium rounded-xl 
              transition-all duration-300 hover:shadow-lg hover:shadow-[#FFB996]/20 hover:scale-105 flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            {t('general.shareResource')}
          </Link>
        )}
      </div>
      
      {/* Arama ve Filtreleme */}
      <div className="bg-white rounded-xl shadow-md p-4 mb-8">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t('general.searchResources')}
                className="w-full px-4 py-3 pr-10 rounded-xl border-[#FFB996] focus:border-[#FF8B5E] focus:ring focus:ring-[#FF8B5E] focus:ring-opacity-50"
              />
              <div className="absolute right-3 top-3 text-[#994D1C]">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 bg-[#FFF5F0] text-[#994D1C] rounded-xl border border-[#FFB996] hover:bg-[#FFE5D9] transition-colors duration-300 flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              {t('general.filterResources')}
            </button>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 bg-[#FFF5F0] text-[#994D1C] rounded-xl border border-[#FFB996] hover:bg-[#FFE5D9] transition-colors duration-300"
            >
              <option value="date">{t('general.resourceDate')}</option>
              <option value="downloads">{t('general.resourceDownloads')}</option>
              <option value="views">{t('general.resourceViews')}</option>
              <option value="title">{t('general.resourceTitle')}</option>
            </select>
            
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-3 py-2 bg-[#FFF5F0] text-[#994D1C] rounded-xl border border-[#FFB996] hover:bg-[#FFE5D9] transition-colors duration-300"
            >
              {sortOrder === 'asc' ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
                </svg>
              )}
            </button>
          </div>
        </div>
        
        {/* Genişletilmiş Filtreler */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-[#FFE5D9]">
            <div>
              <label className="block text-sm font-medium text-[#6B3416] mb-1">
                {t('general.resourceCategory')}
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border-[#FFB996] focus:border-[#FF8B5E] focus:ring focus:ring-[#FF8B5E] focus:ring-opacity-50"
              >
                <option value="">{t('general.allResources')}</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#6B3416] mb-1">
                {t('general.resourceFormat')}
              </label>
              <select
                value={selectedFormat}
                onChange={(e) => setSelectedFormat(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border-[#FFB996] focus:border-[#FF8B5E] focus:ring focus:ring-[#FF8B5E] focus:ring-opacity-50"
              >
                <option value="">{t('general.allResources')}</option>
                {formats.map((format) => (
                  <option key={format} value={format}>
                    {format}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#6B3416] mb-1">
                {t('general.university')}
              </label>
              <select
                value={selectedUniversity}
                onChange={(e) => setSelectedUniversity(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border-[#FFB996] focus:border-[#FF8B5E] focus:ring focus:ring-[#FF8B5E] focus:ring-opacity-50"
              >
                <option value="all">{t('general.allUniversities')}</option>
                {universities.map((university) => (
                  <option key={university} value={university}>
                    {university}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="md:col-span-3 flex justify-end">
              <button
                onClick={() => {
                  setSelectedCategory('');
                  setSelectedFormat('');
                  setSelectedUniversity('all');
                  setSearchTerm('');
                }}
                className="px-4 py-2 text-[#994D1C] hover:text-[#6B3416] transition-colors duration-300"
              >
                {t('general.clearFilters')}
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Sonuç Sayısı */}
      <div className="mb-6">
        <p className="text-[#6B3416]">
          <span className="font-medium">{filteredResources.length}</span> {t('general.resourceSearchResults')}
        </p>
      </div>
      
      {/* Kaynaklar Listesi */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF8B5E]"></div>
        </div>
      ) : filteredResources.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((resource) => (
            <div key={resource.id} className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-[#994D1C] line-clamp-2">{resource.title}</h3>
                  <div className="bg-[#FF8B5E] text-white text-xs px-2 py-1 rounded-lg ml-2 flex-shrink-0">
                    {resource.format}
                  </div>
                </div>
                
                <p className="text-sm text-[#6B3416] mb-3 line-clamp-2">{resource.description}</p>
                
                <div className="flex flex-wrap gap-1 mb-3">
                  {resource.tags.slice(0, 3).map((tag, index) => (
                    <span key={index} className="bg-[#FFE5D9] text-[#994D1C] text-xs px-2 py-1 rounded-full">
                      {tag}
                    </span>
                  ))}
                  {resource.tags.length > 3 && (
                    <span className="bg-[#FFE5D9] text-[#994D1C] text-xs px-2 py-1 rounded-full">
                      +{resource.tags.length - 3}
                    </span>
                  )}
                </div>
                
                <div className="flex justify-between items-center text-xs text-[#6B3416] mb-3">
                  <div>{resource.author}</div>
                  <div>{formatDate(resource.uploadDate)}</div>
                </div>
                
                <div className="flex justify-between items-center text-xs text-[#6B3416] mb-4">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    {resource.viewCount}
                  </div>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    {resource.downloadCount}
                  </div>
                  <div>{formatFileSize(resource.fileSize)}</div>
                </div>
                
                <div className="flex justify-between gap-2">
                  <Link
                    href={`/kaynaklar/${resource.id}`}
                    className="flex-1 px-4 py-2 bg-[#FFF5F0] text-[#994D1C] text-center rounded-lg border border-[#FFB996] hover:bg-[#FFE5D9] transition-colors duration-300 text-sm"
                  >
                    {t('general.resourceView')}
                  </Link>
                  <button
                    onClick={() => {
                      // İndirme sayısını artır
                      const storedResources = localStorage.getItem('sharedResources');
                      if (storedResources) {
                        const parsedResources = JSON.parse(storedResources) as Resource[];
                        const updatedResources = parsedResources.map((r: Resource) => {
                          if (r.id === resource.id) {
                            return { ...r, downloadCount: r.downloadCount + 1 };
                          }
                          return r;
                        });
                        
                        localStorage.setItem('sharedResources', JSON.stringify(updatedResources));
                      }
                      
                      // Eğer gerçek bir URL varsa, indirme işlemi yap
                      if (resource.url && resource.url !== '#') {
                        window.open(resource.url, '_blank');
                      } else {
                        // Örnek bir dosya indirme simülasyonu
                        const link = document.createElement('a');
                        link.href = '/sample-files/sample.pdf'; // Örnek bir dosya yolu
                        link.download = `${resource.title}.${resource.format.toLowerCase()}`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }
                    }}
                    className="flex-1 px-4 py-2 bg-[#FF8B5E] text-white text-center rounded-lg hover:bg-[#FF7A45] transition-colors duration-300 text-sm cursor-pointer"
                  >
                    {t('general.resourceDownload')}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md p-8 text-center">
          <div className="text-[#994D1C] text-5xl mb-4">
            <svg className="w-20 h-20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-[#994D1C] mb-4">{t('general.resourceSearchNoResults')}</h2>
          <p className="text-[#6B3416] mb-6">
            {t('general.noResultsForSearch')}
          </p>
          {user && (
            <Link
              href="/kaynaklar/paylas"
              className="px-6 py-3 bg-[#FF8B5E] text-white font-medium rounded-xl 
                transition-all duration-300 hover:bg-[#FF7A45]"
            >
              {t('general.shareResource')}
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
