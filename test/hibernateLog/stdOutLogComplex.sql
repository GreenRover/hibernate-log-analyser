select
  hotfahrweg_.HFW_ID,
  hotfahrweg_.HFW_CREATEDATUM as HFW_CREATEDATUM2_8_,
  hotfahrweg_.HFW_CREATEUSER as HFW_CREATEUSER3_8_,
  hotfahrweg_.HFW_MUTDATUM as HFW_MUTDATUM4_8_,
  hotfahrweg_.HFW_MUTUSER as HFW_MUTUSER5_8_,
  hotfahrweg_.HFW_CC_VERSION as HFW_CC_VERSION6_8_,
  hotfahrweg_.HFW_AUSGABEKANAL as HFW_AUSGABEKANAL7_8_,
  hotfahrweg_.HFW_HOT_BEREICH as HFW_HOT_BEREICH8_8_,
  hotfahrweg_.HFW_HOT_GEBIET_ID as HFW_HOT_GEBIET_ID9_8_
from
  RCSUS_HOT.RCSTB_HOT_FAHRWEG hotfahrweg_
where
  hotfahrweg_.HFW_ID = ?;

insert into
  RCSUS_HOT.RCSTB_HOT_GEBIET (
    HGB_CREATEDATUM,
    HGB_CREATEUSER,
    HGB_MUTDATUM,
    HGB_MUTUSER,
    HGB_CC_VERSION,
    HGB_BEZEICHNUNG,
    HGB_DEFAULT_RMK_ID,
    HGB_GUELTIG_AB,
    HGB_GUELTIG_BIS,
    HGB_GEBIET_STATUS,
    HGB_KEY,
    HGB_PRIORITAET_HOCH,
    HGB_PRIORITAET_NIEDRIG,
    HGB_PRIORITAET_NORMAL,
    HGB_SCHALTBEREICH_ID,
    HGB_ID
  )
values
  (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);