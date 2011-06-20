using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using Ninject;
using NLog;
using NzbDrone.Core.Helpers;
using NzbDrone.Core.Model.Notification;
using NzbDrone.Core.Providers.Core;
using NzbDrone.Core.Repository;
using NzbDrone.Core.Repository.Quality;
using PetaPoco;

namespace NzbDrone.Core.Providers
{
    public class MediaFileProvider
    {
        private static readonly Logger Logger = LogManager.GetCurrentClassLogger();
        private readonly EpisodeProvider _episodeProvider;
        private readonly ConfigProvider _configProvider;
        private readonly IDatabase _database;

        [Inject]
        public MediaFileProvider(EpisodeProvider episodeProvider, ConfigProvider configProvider, IDatabase database)
        {
            _episodeProvider = episodeProvider;
            _configProvider = configProvider;
            _database = database;
        }

        public MediaFileProvider() { }









        public virtual void Update(EpisodeFile episodeFile)
        {
            _database.Update(episodeFile);
        }

        public virtual EpisodeFile GetEpisodeFile(int episodeFileId)
        {
            return _database.Single<EpisodeFile>(episodeFileId);
        }

        public virtual List<EpisodeFile> GetEpisodeFiles()
        {
            return _database.Fetch<EpisodeFile>();
        }

        public virtual IList<EpisodeFile> GetSeriesFiles(int seriesId)
        {
            return _database.Fetch<EpisodeFile>("WHERE seriesId= @0", seriesId);
        }

        public virtual Tuple<int, int> GetEpisodeFilesCount(int seriesId)
        {
            var allEpisodes = _episodeProvider.GetEpisodeBySeries(seriesId).ToList();

            var episodeTotal = allEpisodes.Where(e => !e.Ignored && e.AirDate <= DateTime.Today && e.AirDate.Year > 1900).ToList();
            var avilableEpisodes = episodeTotal.Where(e => e.EpisodeFileId > 0).ToList();

            return new Tuple<int, int>(avilableEpisodes.Count, episodeTotal.Count);
        }

        public virtual FileInfo CalculateFilePath(Series series, int seasonNumber, string fileName, string extention)
        {
            var path = series.Path;
            if (series.SeasonFolder)
            {
                path = Path.Combine(path, "Season " + seasonNumber);
            }

            path = Path.Combine(path, fileName + extention);

            return new FileInfo(path);
        }


        public virtual string GetNewFilename(IList<Episode> episodes, string seriesTitle, QualityTypes quality)
        {
            var separatorStyle = EpisodeSortingHelper.GetSeparatorStyle(_configProvider.SeparatorStyle);
            var numberStyle = EpisodeSortingHelper.GetNumberStyle(_configProvider.NumberStyle);

            var episodeNames = episodes[0].Title;

            var result = String.Empty;

            if (_configProvider.SeriesName)
            {
                result += seriesTitle + separatorStyle.Pattern;
            }

            result += numberStyle.Pattern.Replace("%0e", String.Format("{0:00}", episodes[0].EpisodeNumber));

            if (episodes.Count > 1)
            {
                var multiEpisodeStyle = EpisodeSortingHelper.GetMultiEpisodeStyle(_configProvider.MultiEpisodeStyle);

                foreach (var episode in episodes.OrderBy(e => e.EpisodeNumber).Skip(1))
                {
                    if (multiEpisodeStyle.Name == "Duplicate")
                    {
                        result += separatorStyle.Pattern + numberStyle.Pattern;
                    }
                    else
                    {
                        result += multiEpisodeStyle.Pattern;
                    }

                    result = result.Replace("%0e", String.Format("{0:00}", episode.EpisodeNumber));
                    episodeNames += String.Format(" + {0}", episode.Title);
                }
            }

            result = result
                .Replace("%s", String.Format("{0}", episodes.First().SeasonNumber))
                .Replace("%0s", String.Format("{0:00}", episodes.First().SeasonNumber))
                .Replace("%x", numberStyle.EpisodeSeparator)
                .Replace("%p", separatorStyle.Pattern);

            if (_configProvider.EpisodeName)
            {
                episodeNames = episodeNames.TrimEnd(' ', '+');
                result += separatorStyle.Pattern + episodeNames;
            }

            if (_configProvider.AppendQuality)
                result += String.Format(" [{0}]", quality);

            if (_configProvider.ReplaceSpaces)
                result = result.Replace(' ', '.');

            Logger.Debug("New File Name is: {0}", result.Trim());
            return result.Trim();
        }






    }
}