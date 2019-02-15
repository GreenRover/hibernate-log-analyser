select
  betriebspu0_.ID_VERSION as ID_VERSION1_23_,
  betriebspu0_.ID_BETRIEBSPUNKT as ID_BETRIEBSPUNKT2_23_,
  betriebspu0_.BP_ABKUERZUNG as BP_ABKUERZUNG3_23_,
  betriebspu0_.BEZEICHNUNG as BEZEICHNUNG4_23_,
  betriebspu0_.IDT_DIENSTSTELLENART as IDT_DIENSTSTELLENA5_23_,
  betriebspu0_.GUELTIG_AB as GUELTIG_AB6_23_,
  betriebspu0_.GUELTIG_BIS as GUELTIG_BIS7_23_,
  betriebspu0_.STAO_KOORDINATEN_1 as STAO_KOORDINATEN_8_23_,
  betriebspu0_.STAO_KOORDINATEN_2 as STAO_KOORDINATEN_9_23_,
  betriebspu0_.STAO_KOORDINATEN_3 as STAO_KOORDINATEN_10_23_,
  (
    select
      NVL(max(bi.BPI_ZON_ID), 0)
    from
      Betriebspunkt_Info bi
    where
      bi.BPI_ID_BETRIEBSPUNKT = betriebspu0_.ID_BETRIEBSPUNKT
  ) as formula0_,
  (
    select
      z.ZON_REL_RCSD
    from
      zone z
    where
      z.zon_id = (
        select
          NVL(max(bi.BPI_ZON_ID), 0)
        from
          Betriebspunkt_Info bi
        where
          bi.BPI_ID_BETRIEBSPUNKT = betriebspu0_.ID_BETRIEBSPUNKT
      )
  ) as formula1_,
  (
    select
      z.ZON_REL_EXT
    from
      zone z
    where
      z.zon_id = (
        select
          NVL(max(bi.BPI_ZON_ID), 0)
        from
          Betriebspunkt_Info bi
        where
          bi.BPI_ID_BETRIEBSPUNKT = betriebspu0_.ID_BETRIEBSPUNKT
      )
  ) as formula2_
from
  BETRIEBSPUNKT betriebspu0_
where
  (
    select
      z.ZON_REL_RCSD
    from
      zone z
    where
      z.zon_id = (
        select
          NVL(max(bi.BPI_ZON_ID), 0)
        from
          Betriebspunkt_Info bi
        where
          bi.BPI_ID_BETRIEBSPUNKT = betriebspu0_.ID_BETRIEBSPUNKT
      )
  ) = 'T';