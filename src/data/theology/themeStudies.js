/**
 * Biblioteca de Estudios Teológicos Sistemáticos e Investigación para Genesis Explorer.
 * Carga directamente la base de datos descargada de La Biblia del Expositor (The Expositor's Bible)
 * y la Biblia Temática de Nave (Nave's Topical Bible).
 */

import genesisStudiesData from '../studies/genesis_studies.json';

export const THEOLOGICAL_STUDIES = genesisStudiesData.studies || {};
export const LIBRARY_INFO = {
  source: genesisStudiesData.library_source,
  edition: genesisStudiesData.edition_info
};
