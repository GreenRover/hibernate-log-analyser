select
  distinct ID_VERSION,
  UIC_LAENDERCODE
FROM
  nutzung_system ns
WHERE
  betriebspu0_.ID_BETRIEBSPUNKT = 1007
  and betriebspu0_.GUELTIG_AB <= TO_TIMESTAMP(
    '2018-02-22 09:00:55.53',
    'YYYY-MM-DD HH24:MI:SS'
  )
  /* 2018-02-22 09:00:55.53 */
  and betriebspu0_.GUELTIG_BIS > TO_TIMESTAMP(
    '2018-02-22 09:00:55.53',
    'YYYY-MM-DD HH24:MI:SS'
  )
  /* 2018-02-22 09:00:55.53 */;

select
  distinct ID_VERSION,
  UIC_LAENDERCODE
FROM
  nutzung_system ns
WHERE
  betriebspu0_.ID_BETRIEBSPUNKT = 1007
  and betriebspu0_.GUELTIG_AB <= TO_TIMESTAMP('2019-02-22 09:30:47', 'YYYY-MM-DD HH24:MI:SS')
  /* Fri Feb 22 09:30:47 CET 2019 */
  and betriebspu0_.GUELTIG_BIS > TO_TIMESTAMP('2019-02-22 09:30:47', 'YYYY-MM-DD HH24:MI:SS')
  /* Fri Feb 22 09:30:47 CET 2019 */;