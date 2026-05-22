<?php

declare(strict_types=1);

namespace Solaris;

use DateTimeImmutable;
use DateTimeInterface;
use InvalidArgumentException;

final class MoonPhase
{
    /**
     * Astronomical constants
     */
    private const EPOCH = 2444238.5;
    private const UNIX_EPOCH_JULIAN = 2440587.5;
    private const SYNODIC_MONTH = 29.53058868;

    /**
     * Sun constants
     */
    private const ELONGE = 278.833540;
    private const ELONGP = 282.596403;
    private const ECCENT = 0.016718;
    private const SUNS_MAX = 1.495985e8;
    private const SUN_ANG_SIZE = 0.533128;

    /**
     * Moon orbit constants
     */
    private const MOON_MEAN_LONGITUDE = 64.975464;
    private const MOON_MEAN_PERIGEE = 349.383063;
    private const MOON_NODE_MEAN_LONGITUDE = 151.950429;
    private const MOON_INCLINATION = 5.145396;
    private const MOON_ECCENTRICITY = 0.054900;
    private const MOON_ANGULAR_SIZE = 0.5181;
    private const MOON_SEMIMAJOR_AXIS = 384401;

    /**
     * Phase names
     */
    private const PHASE_NAMES = [
        'Nouvelle lune',
        'Premier croissant',
        'Premier quartier',
        'Gibbeuse croissante',
        'Pleine lune',
        'Gibbeuse décroissante',
        'Dernier quartier',
        'Dernier croissant',
        'Nouvelle lune',
    ];

    private int $timestamp;

    private float $phase = 0.0;
    private float $illumination = 0.0;
    private float $age = 0.0;
    private float $distance = 0.0;
    private float $angularDiameter = 0.0;
    private float $sunDistance = 0.0;
    private float $sunAngularDiameter = 0.0;

    /**
     * @var array<int, int>|null
     */
    private ?array $quarters = null;

    public function __construct(DateTimeInterface|int|null $date = null)
    {
        $this->timestamp = match (true) {
            $date instanceof DateTimeInterface => $date->getTimestamp(),
            is_int($date) => $date,
            default => time(),
        };

        $this->calculate();
    }

    /**
     * Main moon calculations
     */
    private function calculate(): void
    {
        $julianDate = $this->toJulian($this->timestamp);

        /**
         * Sun position
         */
        $day = $julianDate - self::EPOCH;

        $N = $this->fixAngle((360 / 365.2422) * $day);
        $M = $this->fixAngle($N + self::ELONGE - self::ELONGP);

        $Ec = $this->kepler($M, self::ECCENT);
        $Ec = sqrt((1 + self::ECCENT) / (1 - self::ECCENT)) * tan($Ec / 2);
        $Ec = 2 * rad2deg(atan($Ec));

        $lambdaSun = $this->fixAngle($Ec + self::ELONGP);

        $F = (
            (1 + self::ECCENT * $this->cosDeg($Ec)) /
            (1 - self::ECCENT * self::ECCENT)
        );

        $sunDistance = self::SUNS_MAX / $F;
        $sunAngularSize = $F * self::SUN_ANG_SIZE;

        /**
         * Moon position
         */
        $moonLongitude = $this->fixAngle(
            13.1763966 * $day + self::MOON_MEAN_LONGITUDE
        );

        $moonMeanAnomaly = $this->fixAngle(
            $moonLongitude
            - 0.1114041 * $day
            - self::MOON_MEAN_PERIGEE
        );

        $moonNodeLongitude = $this->fixAngle(
            self::MOON_NODE_MEAN_LONGITUDE
            - 0.0529539 * $day
        );

        $evection = 1.2739 * $this->sinDeg(
            2 * ($moonLongitude - $lambdaSun) - $moonMeanAnomaly
        );

        $annualEquation = 0.1858 * $this->sinDeg($M);

        $A3 = 0.37 * $this->sinDeg($M);

        $correctedAnomaly = (
            $moonMeanAnomaly
            + $evection
            - $annualEquation
            - $A3
        );

        $equationOfCenter = 6.2886 * $this->sinDeg($correctedAnomaly);

        $A4 = 0.214 * $this->sinDeg(2 * $correctedAnomaly);

        $correctedLongitude = (
            $moonLongitude
            + $evection
            + $equationOfCenter
            - $annualEquation
            + $A4
        );

        $variation = 0.6583 * $this->sinDeg(
            2 * ($correctedLongitude - $lambdaSun)
        );

        $trueLongitude = $correctedLongitude + $variation;

        /**
         * Moon phase
         */
        $moonAge = $trueLongitude - $lambdaSun;

        $moonPhase = (
            1 - $this->cosDeg($moonAge)
        ) / 2;

        /**
         * Moon distance
         */
        $moonDistance = (
            self::MOON_SEMIMAJOR_AXIS
            * (1 - self::MOON_ECCENTRICITY * self::MOON_ECCENTRICITY)
        ) / (
            1 + self::MOON_ECCENTRICITY *
            $this->cosDeg($correctedAnomaly + $equationOfCenter)
        );

        $moonDistanceFraction = (
            $moonDistance / self::MOON_SEMIMAJOR_AXIS
        );

        $moonAngularSize = (
            self::MOON_ANGULAR_SIZE / $moonDistanceFraction
        );

        /**
         * Store results
         */
        $this->phase = $this->fixAngle($moonAge) / 360;
        $this->illumination = $moonPhase;
        $this->age = self::SYNODIC_MONTH * $this->phase;
        $this->distance = $moonDistance;
        $this->angularDiameter = $moonAngularSize;
        $this->sunDistance = $sunDistance;
        $this->sunAngularDiameter = $sunAngularSize;
    }

    /**
     * Normalize angle
     */
    private function fixAngle(float $angle): float
    {
        return $angle - 360 * floor($angle / 360);
    }

    /**
     * Solve Kepler equation
     */
    private function kepler(float $meanAnomaly, float $eccentricity): float
    {
        $epsilon = 1e-6;

        $e = deg2rad($meanAnomaly);
        $m = $e;

        do {
            $delta = $e - $eccentricity * sin($e) - $m;

            $e -= $delta / (
                1 - $eccentricity * cos($e)
            );
        } while (abs($delta) > $epsilon);

        return $e;
    }

    private function sinDeg(float $degrees): float
    {
        return sin(deg2rad($degrees));
    }

    private function cosDeg(float $degrees): float
    {
        return cos(deg2rad($degrees));
    }

    private function toJulian(int $timestamp): float
    {
        return $timestamp / 86400 + self::UNIX_EPOCH_JULIAN;
    }

    /**
     * Public API
     */
    public function phase(): float
    {
        return $this->phase;
    }

    public function illumination(): float
    {
        return $this->illumination;
    }

    public function age(): float
    {
        return $this->age;
    }

    public function distance(): float
    {
        return $this->distance;
    }

    public function angularDiameter(): float
    {
        return $this->angularDiameter;
    }

    public function sunDistance(): float
    {
        return $this->sunDistance;
    }

    public function sunAngularDiameter(): float
    {
        return $this->sunAngularDiameter;
    }

    public function phaseName(): string
    {
        $index = (int) floor(
            ($this->phase + 0.0625) * 8
        );

        return self::PHASE_NAMES[$index];
    }

    /**
     * Return all data
     */
    public function toArray(): array
    {
        return [
            'timestamp'            => $this->timestamp,
            'date'                 => (new DateTimeImmutable())
                ->setTimestamp($this->timestamp)
                ->format('Y-m-d H:i:s'),

            'phase'                => $this->phase(),
            'phase_name'           => $this->phaseName(),
            'illumination'         => $this->illumination(),
            'age'                  => $this->age(),

            'distance_km'          => $this->distance(),
            'angular_diameter'     => $this->angularDiameter(),

            'sun_distance_km'      => $this->sunDistance(),
            'sun_angular_diameter' => $this->sunAngularDiameter(),
        ];
    }
}
